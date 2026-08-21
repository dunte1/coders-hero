<?php

namespace App\Services\Hr;

use App\Models\Employee;
use App\Models\Payroll;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    public function index(array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Payroll::query()
            ->withCount('payslips')
            ->with('processedBy')
            ->when($filters['month'] ?? null, fn (Builder $q) => $q->byMonth($filters['month']))
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']));

        return $query->orderByDesc('month')->orderByDesc('id')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function show(int $id): Payroll
    {
        return Payroll::with(['payslips.employee.user', 'payslips.employee.department', 'processedBy'])
            ->findOrFail($id);
    }

    public function payslip(int $id): Payslip
    {
        return Payslip::with(['employee.user', 'employee.department', 'employee.position', 'payroll'])
            ->findOrFail($id);
    }

    public function run(string $month, User $user): Payroll
    {
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            throw new \RuntimeException('Month must use the YYYY-MM format.', 422);
        }

        $existing = Payroll::where('month', $month)->whereIn('status', ['draft', 'processed', 'paid'])->first();
        if ($existing) {
            throw new \RuntimeException("Payroll for {$month} already exists.", 422);
        }

        $employees = Employee::query()->active()->get();

        if ($employees->isEmpty()) {
            throw new \RuntimeException('No active employees to include in payroll.', 422);
        }

        return DB::transaction(function () use ($month, $user, $employees) {
            $payroll = Payroll::create([
                'payroll_no' => $this->generatePayrollNo($month),
                'month' => $month,
                'status' => 'draft',
                'gross_total' => 0,
                'deductions_total' => 0,
                'net_total' => 0,
                'processed_by_user_id' => $user->id,
            ]);

            $grossTotal = 0;
            $deductionsTotal = 0;

            foreach ($employees as $employee) {
                $gross = $this->grossFor($employee);
                $deductions = $this->deductionsFor($employee, $gross);
                $net = max(0, $gross - $deductions);

                $grossTotal += $gross;
                $deductionsTotal += $deductions;

                Payslip::create([
                    'payroll_id' => $payroll->id,
                    'employee_id' => $employee->id,
                    'gross_amount' => $gross,
                    'deductions_amount' => $deductions,
                    'net_amount' => $net,
                    'deductions_breakdown' => $deductions > 0 ? ['statutory' => round($deductions, 2)] : null,
                    'allowances_breakdown' => null,
                    'status' => 'pending',
                ]);
            }

            $payroll->update([
                'gross_total' => $grossTotal,
                'deductions_total' => $deductionsTotal,
                'net_total' => $grossTotal - $deductionsTotal,
            ]);

            return $payroll->fresh(['payslips.employee.user', 'processedBy']);
        });
    }

    public function process(int $id, User $user): Payroll
    {
        $payroll = Payroll::with('payslips')->findOrFail($id);

        if ($payroll->status !== 'draft') {
            throw new \RuntimeException('Only draft payrolls can be processed.', 422);
        }

        $payroll->update([
            'status' => 'processed',
            'processed_by_user_id' => $user->id,
            'processed_at' => now(),
        ]);

        return $payroll->fresh(['payslips.employee.user', 'processedBy']);
    }

    public function markPaid(int $id, array $data, User $user): Payroll
    {
        $payroll = Payroll::with('payslips')->findOrFail($id);

        if (!in_array($payroll->status, ['draft', 'processed'])) {
            throw new \RuntimeException('This payroll cannot be marked as paid.', 422);
        }

        DB::transaction(function () use ($payroll, $data, $user) {
            foreach ($payroll->payslips as $payslip) {
                $payslip->update([
                    'status' => 'paid',
                    'payment_method' => $data['payment_method'] ?? 'bank_transfer',
                    'paid_at' => now(),
                ]);
            }

            $payroll->update([
                'status' => 'paid',
                'processed_by_user_id' => $user->id,
                'processed_at' => $payroll->processed_at ?? now(),
            ]);
        });

        return $payroll->fresh(['payslips.employee.user', 'processedBy']);
    }

    public function cancel(int $id, ?User $user = null): Payroll
    {
        $payroll = Payroll::with('payslips')->findOrFail($id);

        if ($payroll->status === 'paid') {
            throw new \RuntimeException('A paid payroll cannot be cancelled.', 422);
        }

        DB::transaction(function () use ($payroll) {
            $payroll->payslips()->update(['status' => 'cancelled']);
            $payroll->update(['status' => 'cancelled']);
        });

        return $payroll->fresh(['payslips.employee.user']);
    }

    public function myPayslips(int $employeeId, array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Payslip::with('payroll')
            ->where('employee_id', $employeeId)
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->orderByDesc('id')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function grossFor(Employee $employee): float
    {
        $contract = $employee->activeContract();

        return (float) ($contract?->salary ?? $employee->salary ?? 0);
    }

    public function deductionsFor(Employee $employee, float $gross): float
    {
        return 0.0;
    }

    private function generatePayrollNo(string $month): string
    {
        $last = Payroll::where('payroll_no', 'like', "PRL-{$month}-%")->latest('id')->first();
        $number = $last ? (int) substr($last->payroll_no, -4) + 1 : 1;

        return "PRL-{$month}-" . str_pad((string) $number, 4, '0', STR_PAD_LEFT);
    }
}
