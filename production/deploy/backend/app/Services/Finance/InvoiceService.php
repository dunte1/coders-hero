<?php

namespace App\Services\Finance;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Student;
use App\Models\User;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    public function index(array $filters): LengthAwarePaginator
    {
        return Invoice::query()
            ->with(['student', 'feeStructure'])
            ->withCount('items')
            ->when(($filters['student_id'] ?? null), fn ($q, $v) => $q->where('student_id', $v))
            ->when(($filters['status'] ?? null) && ($filters['status'] !== 'all'), fn ($q, $v) => $q->where('status', $v))
            ->when(($filters['term'] ?? null), fn ($q, $v) => $q->where('term', $v))
            ->when(($filters['search'] ?? null), function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('invoice_no', 'like', "%{$v}%")
                        ->orWhere('description', 'like', "%{$v}%")
                        ->orWhereHas('student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%")->orWhere('student_id', 'like', "%{$v}%"));
                });
            })
            ->orderByDesc('created_at')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function show(int $id): Invoice
    {
        return Invoice::with(['student', 'feeStructure', 'createdBy', 'items', 'payments.paidBy', 'mpesaTransactions'])
            ->findOrFail($id);
    }

    public function create(User $user, array $data, array $items = []): Invoice
    {
        return DB::transaction(function () use ($user, $data, $items) {
            $invoice = Invoice::create([
                'invoice_no' => $this->nextInvoiceNumber(),
                'student_id' => $data['student_id'],
                'fee_structure_id' => $data['fee_structure_id'] ?? null,
                'term' => $data['term'] ?? null,
                'description' => $data['description'] ?? null,
                'amount' => $this->resolveAmount($data, $items),
                'status' => $data['status'] ?? 'issued',
                'due_date' => $data['due_date'] ?? null,
                'issued_at' => now(),
                'created_by_user_id' => $user->id,
            ]);

            if ($items) {
                $this->syncItems($invoice, $items);
                $invoice->refresh();
            }

            return $invoice->load(['student', 'feeStructure', 'items']);
        });
    }

    /**
     * Generate one invoice per matching active student from a fee structure.
     * Skips students that already hold an open invoice for the same structure + term.
     *
     * @return int number of invoices created
     */
    public function generateFromStructure(User $user, int $feeStructureId, ?string $gradeLevel = null): int
    {
        $structure = \App\Models\FeeStructure::findOrFail($feeStructureId);

        return DB::transaction(function () use ($user, $structure, $gradeLevel) {
            $grade = $gradeLevel ?: $structure->grade_level;
            $term = $structure->term;

            $students = Student::query()
                ->active()
                ->when($grade, fn ($q, $g) => $q->where('grade', $g))
                ->get();

            $count = 0;

            foreach ($students as $student) {
                $hasOpen = Invoice::query()
                    ->where('student_id', $student->id)
                    ->where('fee_structure_id', $structure->id)
                    ->when($term, fn ($q, $t) => $q->where('term', $t))
                    ->whereIn('status', ['draft', 'issued', 'partial', 'overdue'])
                    ->exists();

                if ($hasOpen) {
                    continue;
                }

                $this->create($user, [
                    'student_id' => $student->id,
                    'fee_structure_id' => $structure->id,
                    'term' => $term,
                    'description' => $structure->name,
                    'amount' => (float) $structure->amount,
                    'status' => 'issued',
                ], [
                    [
                        'description' => $structure->name,
                        'amount' => (float) $structure->amount,
                        'qty' => 1,
                    ],
                ]);

                $count++;
            }

            return $count;
        });
    }

    public function update(User $user, Invoice $invoice, array $data, array $items = []): Invoice
    {
        if (!$invoice->isEditable()) {
            throw new \RuntimeException('Only draft, issued or partially paid invoices can be edited.', 422);
        }

        return DB::transaction(function () use ($invoice, $data, $items) {
            $invoice->update([
                'student_id' => $data['student_id'] ?? $invoice->student_id,
                'fee_structure_id' => $data['fee_structure_id'] ?? $invoice->fee_structure_id,
                'term' => $data['term'] ?? $invoice->term,
                'description' => $data['description'] ?? $invoice->description,
                'due_date' => $data['due_date'] ?? $invoice->due_date,
            ]);

            if ($items) {
                $this->syncItems($invoice, $items);
                $invoice->amount = $this->sumItems($items);
                $invoice->save();
                $invoice->recalculateFromPayments();
            }

            return $invoice->fresh(['student', 'feeStructure', 'items', 'payments']);
        });
    }

    public function issue(Invoice $invoice): Invoice
    {
        if ($invoice->status !== 'draft') {
            throw new \RuntimeException('Only draft invoices can be issued.', 422);
        }

        $invoice->update([
            'status' => 'issued',
            'issued_at' => now(),
        ]);

        $this->notifyRecipient($invoice, 'invoice.issued', 'Invoice issued');

        return $invoice->fresh(['student', 'items']);
    }

    public function void(Invoice $invoice): Invoice
    {
        if ($invoice->isPaid()) {
            throw new \RuntimeException('Paid invoices cannot be voided.', 422);
        }

        if ($invoice->isVoid()) {
            return $invoice;
        }

        $invoice->update(['status' => 'void']);

        return $invoice->fresh(['student']);
    }

    private function notifyRecipient(Invoice $invoice, string $event, string $title): void
    {
        $student = $invoice->student;
        $user = $student?->user;

        if (!$user) {
            return;
        }

        app(NotificationDispatcher::class)->notify(
            $user,
            $event,
            [
                'title' => $title . ' #' . $invoice->invoice_no,
                'user_name' => $user->name ?? 'there',
                'student_name' => $student?->full_name ?? 'your student',
                'invoice_number' => $invoice->invoice_no,
                'amount' => number_format((float) $invoice->amount, 2),
                'due_date' => $invoice->due_date?->format('M j, Y') ?? 'N/A',
                'date' => now()->format('M j, Y'),
            ],
            '/invoices/' . $invoice->id
        );
    }

    /**
     * Invoices accessible to the current user (staff = all, otherwise own/ward invoices).
     */
    public function forUser(User $user, array $studentIds): Collection
    {
        $query = Invoice::with(['student', 'items'])
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('created_at');

        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return $query->get();
        }

        return $query->whereNotIn('status', ['draft', 'void'])->get();
    }

    private function nextInvoiceNumber(): string
    {
        return 'INV-' . now()->format('Y') . '-' . strtoupper(Str::random(8));
    }

    private function resolveAmount(array $data, array $items): float
    {
        if ($items) {
            return $this->sumItems($items);
        }

        return (float) ($data['amount'] ?? 0);
    }

    private function sumItems(array $items): float
    {
        return round(collect($items)->sum(fn ($i) => (float) ($i['amount'] ?? 0) * (int) ($i['qty'] ?? 1)), 2);
    }

    private function syncItems(Invoice $invoice, array $items): void
    {
        $invoice->items()->delete();

        foreach ($items as $item) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $item['description'],
                'amount' => $item['amount'],
                'qty' => $item['qty'] ?? 1,
                'total' => round((float) $item['amount'] * (int) ($item['qty'] ?? 1), 2),
            ]);
        }
    }
}
