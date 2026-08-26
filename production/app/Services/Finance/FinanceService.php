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
use Illuminate\Support\Facades\DB;

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

        $outstanding = (float) Invoice::whereIn('status', ['issued', 'partial', 'overdue'])
            ->sum(DB::raw('amount - paid_amount'));

        $totalExpenses = (float) Expense::sum('amount');
        $budgetAllocated = (float) Budget::sum('allocated_amount');
        $budgetSpent = (float) Expense::where('approval_status', 'approved')->sum('amount');

        return [
            'total_invoiced' => $totalInvoiced,
            'total_collected' => $collected,
            'outstanding' => round($outstanding, 2),
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
        $query = Student::query()
            ->active()
            ->select('students.*')
            ->selectRaw('
                COALESCE(SUM(CASE WHEN invoices.status IN (?, ?, ?) THEN invoices.amount ELSE 0 END), 0) as invoiced,
                COALESCE(SUM(CASE WHEN invoices.status IN (?, ?, ?) THEN invoices.paid_amount ELSE 0 END), 0) as paid,
                COALESCE(SUM(CASE WHEN invoices.status IN (?, ?, ?) THEN (invoices.amount - invoices.paid_amount) ELSE 0 END), 0) as balance,
                COUNT(CASE WHEN invoices.status IN (?, ?, ?) THEN 1 END) as open_invoices
            ', ['issued', 'partial', 'overdue', 'issued', 'partial', 'overdue', 'issued', 'partial', 'overdue', 'issued', 'partial', 'overdue'])
            ->leftJoin('invoices', 'students.id', '=', 'invoices.student_id')
            ->when(($filters['grade'] ?? null) && ($filters['grade'] !== 'all'), fn ($q, $v) => $q->where('students.grade', $v))
            ->when(($filters['search'] ?? null), fn ($q, $v) => $q->where(function ($sq) use ($v) {
                $sq->where('students.first_name', 'like', "%{$v}%")
                    ->orWhere('students.last_name', 'like', "%{$v}%")
                    ->orWhere('students.student_id', 'like', "%{$v}%");
            }))
            ->groupBy('students.id')
            ->havingRaw('balance > 0')
            ->orderByDesc('balance');

        $perPage = (int) ($filters['per_page'] ?? 15);
        $page = (int) ($filters['page'] ?? 1);

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $mapped = $paginator->getCollection()->map(function ($student) {
            return [
                'student' => [
                    'id' => $student->id,
                    'student_id' => $student->student_id,
                    'full_name' => $student->full_name,
                    'grade' => $student->grade,
                ],
                'open_invoices' => (int) $student->open_invoices,
                'invoiced' => round((float) $student->invoiced, 2),
                'paid' => round((float) $student->paid, 2),
                'balance' => round((float) $student->balance, 2),
            ];
        });

        return new LengthAwarePaginator(
            $mapped,
            $paginator->total(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
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
     * Uses DB-level queries to avoid loading all records into memory.
     */
    public function transactions(array $filters): LengthAwarePaginator
    {
        $from = $filters['from'] ?? null;
        $to = $filters['to'] ?? null;
        $search = $filters['search'] ?? null;
        $perPage = (int) ($filters['per_page'] ?? 15);

        $paymentsQuery = Payment::query()
            ->select('id', 'receipt_no as reference', 'amount', 'method', 'paid_at as date')
            ->selectRaw("'payment' as type, 'in' as direction")
            ->when($from, fn ($q, $v) => $q->whereDate('paid_at', '>=', $v))
            ->when($to, fn ($q, $v) => $q->whereDate('paid_at', '<=', $v));

        $expensesQuery = Expense::query()
            ->select('id', 'receipt_ref as reference', 'amount', 'expense_date as date')
            ->selectRaw("'expense' as type, 'out' as direction, null as method")
            ->when($from, fn ($q, $v) => $q->whereDate('expense_date', '>=', $v))
            ->when($to, fn ($q, $v) => $q->whereDate('expense_date', '<=', $v));

        $combined = $paymentsQuery->unionAll($expensesQuery);

        $query = DB::query()->fromSub($combined, 'combined');

        $total = (clone $query)->count();

        $page = max(1, (int) ($filters['page'] ?? 1));
        $offset = ($page - 1) * $perPage;

        $items = $query->orderByDesc('date')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        return new Paginator(
            $items->toArray(),
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
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
