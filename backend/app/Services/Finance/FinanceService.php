<?php

namespace App\Services\Finance;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Collection;

class FinanceService
{
    /**
     * Student ids visible to the current user.
     *
     * @return array<int>
     */
    public function accessibleStudentIds(?User $user = null): array
    {
        $user ??= auth()->user();

        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return Student::pluck('id')->all();
        }

        $student = Student::where('user_id', $user->id)->first();

        if ($student) {
            return [$student->id];
        }

        $guardian = $user->guardian;

        return $guardian ? $guardian->students()->pluck('students.id')->all() : [];
    }

    public function summary(): array
    {
        $totalInvoiced = (float) Invoice::whereNotIn('status', ['draft', 'void'])->sum('amount');
        $collected = (float) Payment::sum('amount');

        $openInvoices = Invoice::whereIn('status', ['issued', 'partial', 'overdue'])->get();
        $outstanding = round($openInvoices->sum(fn (Invoice $i) => $i->balance), 2);

        $totalExpenses = (float) Expense::sum('amount');
        $budgetAllocated = (float) Budget::sum('allocated_amount');
        $budgetSpent = (float) Expense::sum('amount');

        return [
            'total_invoiced' => $totalInvoiced,
            'total_collected' => $collected,
            'outstanding' => $outstanding,
            'collections_rate' => $totalInvoiced > 0 ? round(($collected / $totalInvoiced) * 100, 1) : 0,
            'total_expenses' => $totalExpenses,
            'budget_allocated' => $budgetAllocated,
            'budget_spent' => $budgetSpent,
            'budget_utilization' => $budgetAllocated > 0 ? round(($budgetSpent / $budgetAllocated) * 100, 1) : 0,
            'invoice_counts' => [
                'issued' => Invoice::where('status', 'issued')->count(),
                'partial' => Invoice::where('status', 'partial')->count(),
                'paid' => Invoice::where('status', 'paid')->count(),
                'overdue' => Invoice::where('status', 'overdue')->count(),
                'void' => Invoice::where('status', 'void')->count(),
            ],
        ];
    }

    public function collections(array $filters): LengthAwarePaginator
    {
        return Payment::query()
            ->with(['invoice.student', 'fee.student', 'paidBy'])
            ->when(($filters['from'] ?? null), fn ($q, $v) => $q->whereDate('paid_at', '>=', $v))
            ->when(($filters['to'] ?? null), fn ($q, $v) => $q->whereDate('paid_at', '<=', $v))
            ->when(($filters['method'] ?? null) && ($filters['method'] !== 'all'), fn ($q, $v) => $q->where('method', $v))
            ->when(($filters['search'] ?? null), function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('receipt_no', 'like', "%{$v}%")
                        ->orWhere('reference', 'like', "%{$v}%")
                        ->orWhereHas('invoice.student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%")->orWhere('student_id', 'like', "%{$v}%"))
                        ->orWhereHas('fee.student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%")->orWhere('student_id', 'like', "%{$v}%"));
                });
            })
            ->orderByDesc('paid_at')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function outstanding(array $filters): LengthAwarePaginator
    {
        $invoiceIds = Invoice::whereIn('status', ['issued', 'partial', 'overdue'])->get();

        $rows = Student::query()
            ->active()
            ->when(($filters['grade'] ?? null) && ($filters['grade'] !== 'all'), fn ($q, $v) => $q->where('grade', $v))
            ->when(($filters['search'] ?? null), fn ($q, $v) => $q->search($v))
            ->get()
            ->map(function (Student $student) use ($invoiceIds) {
                $invoices = $invoiceIds->where('student_id', $student->id);
                $balance = round($invoices->sum(fn (Invoice $i) => $i->balance), 2);

                return [
                    'student' => [
                        'id' => $student->id,
                        'student_id' => $student->student_id,
                        'full_name' => $student->full_name,
                        'grade' => $student->grade,
                    ],
                    'open_invoices' => $invoices->count(),
                    'invoiced' => round($invoices->sum(fn (Invoice $i) => $i->amount), 2),
                    'paid' => round($invoices->sum(fn (Invoice $i) => (float) $i->paid_amount), 2),
                    'balance' => $balance,
                ];
            })
            ->filter(fn ($row) => $row['balance'] > 0)
            ->sortByDesc('balance')
            ->values();

        return $this->manualPaginate($rows, $filters);
    }

    /**
     * Outstanding summary for a specific set of students (own / wards).
     *
     * @param  array<int>  $studentIds
     * @return array<int, array<string, mixed>>
     */
    public function outstandingForStudents(array $studentIds): array
    {
        if (!$studentIds) {
            return [];
        }

        $open = Invoice::with('student')
            ->whereIn('student_id', $studentIds)
            ->whereIn('status', ['issued', 'partial', 'overdue'])
            ->get();

        return $open->groupBy('student_id')->map(function ($invoices, $studentId) {
            $student = $invoices->first()->student;

            return [
                'student_id' => $studentId,
                'student_code' => $student?->student_id,
                'full_name' => $student?->full_name,
                'grade' => $student?->grade,
                'open_invoices' => $invoices->count(),
                'invoiced' => round($invoices->sum(fn (Invoice $i) => (float) $i->amount), 2),
                'paid' => round($invoices->sum(fn (Invoice $i) => (float) $i->paid_amount), 2),
                'balance' => round($invoices->sum(fn (Invoice $i) => $i->balance), 2),
            ];
        })->sortByDesc('balance')->values()->all();
    }

    public function expenses(array $filters): LengthAwarePaginator
    {
        $query = Expense::query()
            ->with(['recordedBy', 'submitter', 'approver'])
            ->when(($filters['category'] ?? null) && ($filters['category'] !== 'all'), fn ($q, $v) => $q->where('category', $v))
            ->when(($filters['approval_status'] ?? null) && ($filters['approval_status'] !== 'all'), fn ($q, $v) => $q->where('approval_status', $v))
            ->when(($filters['from'] ?? null), fn ($q, $v) => $q->whereDate('expense_date', '>=', $v))
            ->when(($filters['to'] ?? null), fn ($q, $v) => $q->whereDate('expense_date', '<=', $v))
            ->when(($filters['search'] ?? null), fn ($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->orderByDesc('expense_date');

        return $query->paginate((int) ($filters['per_page'] ?? 15));
    }

    /**
     * Expenses grouped by category, with the budget allocated per category where defined.
     */
    public function expensesByCategory(?string $fiscalYear = null): Collection
    {
        $year = $fiscalYear ?: (string) now()->year;

        $expenses = Expense::selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get()
            ->keyBy('category');

        return Budget::where('fiscal_year', (int) $year)
            ->get()
            ->map(function (Budget $budget) use ($expenses) {
                $spent = (float) ($expenses[$budget->category]->total ?? 0);

                return [
                    'category' => $budget->category,
                    'allocated' => (float) $budget->allocated_amount,
                    'spent' => $spent,
                    'remaining' => round(max(0, (float) $budget->allocated_amount - $spent), 2),
                    'utilization' => (float) $budget->allocated_amount > 0 ? round(($spent / (float) $budget->allocated_amount) * 100, 1) : 0,
                ];
            })
            ->values();
    }

    /**
     * Unified financial ledger (payments + expenses), newest first.
     */
    public function transactions(array $filters): LengthAwarePaginator
    {
        $payments = Payment::query()
            ->with(['invoice.student', 'fee.student'])
            ->get()
            ->map(function (Payment $p) {
                return [
                    'id' => $p->id,
                    'type' => 'payment',
                    'date' => $p->paid_at?->toDateString(),
                    'reference' => $p->receipt_no,
                    'amount' => (float) $p->amount,
                    'direction' => 'in',
                    'method' => $p->method,
                    'description' => $p->invoice?->student?->full_name
                        ?? $p->fee?->student?->full_name
                        ?? 'Payment',
                ];
            });

        $expenses = Expense::query()
            ->get()
            ->map(function (Expense $e) {
                return [
                    'id' => $e->id,
                    'type' => 'expense',
                    'date' => $e->expense_date?->toDateString(),
                    'reference' => $e->receipt_ref,
                    'amount' => (float) $e->amount,
                    'direction' => 'out',
                    'method' => null,
                    'description' => $e->title . ($e->category ? ' (' . $e->category . ')' : ''),
                ];
            });

        $all = $payments->concat($expenses)
            ->sortByDesc('date')
            ->values();

        return $this->manualPaginate($all, $filters);
    }

    private function manualPaginate(Collection $rows, array $filters): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 15);
        $page = max(1, (int) ($filters['page'] ?? 1));
        $items = $rows->forPage($page, $perPage)->values()->all();

        return new Paginator(
            $items,
            $rows->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
