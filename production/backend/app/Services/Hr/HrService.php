<?php

namespace App\Services\Hr;

use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\PerformanceReview;
use App\Models\StaffAttendance;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class HrService
{
    public const ANNUAL_LEAVE_ALLOWANCE = 21;

    public function employeeForUser(?User $user): ?Employee
    {
        if (!$user) {
            return null;
        }

        return Employee::with(['user', 'department', 'position'])->where('user_id', $user->id)->first();
    }

    public function summary(): array
    {
        $today = now()->toDateString();
        $month = now()->format('Y-m');

        $attendanceToday = StaffAttendance::where('attendance_date', $today)
            ->get()
            ->groupBy('status')
            ->map->count();

        $activePayroll = Payroll::where('month', $month)
            ->orderByDesc('id')
            ->first();

        return [
            'total_employees' => Employee::withTrashed()->count(),
            'active_employees' => Employee::where('status', 'active')->count(),
            'on_leave_employees' => Employee::where('status', 'on_leave')->count(),
            'terminated_employees' => Employee::whereIn('status', ['terminated', 'resigned'])->count(),
            'departments' => Department::count(),
            'active_contracts' => \App\Models\EmployeeContract::where('status', 'active')->count(),
            'pending_leave_requests' => LeaveRequest::where('status', 'pending')->count(),
            'approved_leave_this_month' => LeaveRequest::where('status', 'approved')
                ->whereYear('start_date', now()->year)
                ->whereMonth('start_date', now()->month)
                ->count(),
            'attendance_today' => [
                'present' => $attendanceToday->get('present', 0),
                'absent' => $attendanceToday->get('absent', 0),
                'late' => $attendanceToday->get('late', 0),
                'half_day' => $attendanceToday->get('half_day', 0),
                'leave' => $attendanceToday->get('leave', 0),
            ],
            'recorded_today' => (int) $attendanceToday->sum(),
            'current_payroll' => $activePayroll ? [
                'payroll_no' => $activePayroll->payroll_no,
                'month' => $activePayroll->month,
                'status' => $activePayroll->status,
                'net_total' => (float) $activePayroll->net_total,
                'employees' => $activePayroll->payslips()->count(),
            ] : null,
            'average_review_rating' => round((float) PerformanceReview::whereNotNull('rating')->avg('rating'), 2),
        ];
    }

    public function mySummary(Employee $employee): array
    {
        $used = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('leave_type', 'annual')
            ->whereYear('start_date', now()->year)
            ->sum('days');

        $latestPayslip = $employee->payslips()
            ->with('payroll')
            ->latest('id')
            ->first();

        return [
            'employee_id' => $employee->id,
            'status' => $employee->status,
            'annual_leave_used' => (int) $used,
            'annual_leave_remaining' => max(0, self::ANNUAL_LEAVE_ALLOWANCE - (int) $used),
            'pending_leave_requests' => LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'pending')->count(),
            'approved_leave_days' => (int) LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')->sum('days'),
            'attendance_this_month' => [
                'present' => $this->countAttendance($employee->id, 'present'),
                'absent' => $this->countAttendance($employee->id, 'absent'),
                'late' => $this->countAttendance($employee->id, 'late'),
            ],
            'latest_payslip' => $latestPayslip ? [
                'payroll_no' => $latestPayslip->payroll?->payroll_no,
                'month' => $latestPayslip->payroll?->month,
                'gross_amount' => (float) $latestPayslip->gross_amount,
                'deductions_amount' => (float) $latestPayslip->deductions_amount,
                'net_amount' => (float) $latestPayslip->net_amount,
                'status' => $latestPayslip->status,
            ] : null,
        ];
    }

    public function headcount(array $filters): array
    {
        $query = Employee::query()
            ->with(['department', 'position'])
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->when($filters['department_id'] ?? null, fn (Builder $q) => $q->byDepartment((int) $filters['department_id']));

        $byDepartment = (clone $query)->get()->groupBy(fn (Employee $e) => $e->department?->name ?? 'Unassigned')
            ->map->count()->sortDesc();

        $byStatus = (clone $query)->get()->groupBy('status')->map->count()->sortDesc();

        $byType = (clone $query)->get()->groupBy('employment_type')->map->count()->sortDesc();

        $departments = Department::query()
            ->withCount('employees')
            ->orderBy('name')
            ->get()
            ->map(fn (Department $d) => [
                'id' => $d->id,
                'name' => $d->name,
                'employees_count' => $d->employees_count,
            ]);

        return [
            'total' => (clone $query)->count(),
            'by_department' => $byDepartment,
            'by_status' => $byStatus,
            'by_type' => $byType,
            'departments' => $departments,
        ];
    }

    public function leaveReport(array $filters): array
    {
        $query = LeaveRequest::query()
            ->with('employee.user')
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->when($filters['leave_type'] ?? null, fn (Builder $q) => $q->byType($filters['leave_type']))
            ->when($filters['from'] ?? null, fn (Builder $q) => $q->whereDate('start_date', '>=', $filters['from']))
            ->when($filters['to'] ?? null, fn (Builder $q) => $q->whereDate('end_date', '<=', $filters['to']));

        $byType = (clone $query)->get()->groupBy('leave_type')->map->count()->sortDesc();
        $byStatus = (clone $query)->get()->groupBy('status')->map->count()->sortDesc();
        $daysUsed = (int) (clone $query)->get()->where('status', 'approved')->sum('days');

        $total = (clone $query)->count();

        return [
            'total_requests' => $total,
            'approved_days' => $daysUsed,
            'by_type' => $byType,
            'by_status' => $byStatus,
        ];
    }

    public function attendanceReport(array $filters): array
    {
        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->toDateString();

        $rows = StaffAttendance::whereBetween('attendance_date', [$from, $to])
            ->with('employee.user')
            ->get()
            ->groupBy('employee_id')
            ->map(function (Collection $records) use ($from, $to) {
                $employee = $records->first()->employee;

                return [
                    'employee_id' => $employee->id,
                    'employee_code' => $employee->employee_id,
                    'employee_name' => $employee->user?->name ?? '—',
                    'department' => $employee->department?->name ?? '—',
                    'present' => $records->where('status', 'present')->count(),
                    'absent' => $records->where('status', 'absent')->count(),
                    'late' => $records->where('status', 'late')->count(),
                    'half_day' => $records->where('status', 'half_day')->count(),
                    'leave' => $records->where('status', 'leave')->count(),
                    'total' => $records->count(),
                    'rate' => $records->count() > 0
                        ? round(($records->whereIn('status', ['present', 'late'])->count() / $records->count()) * 100, 1)
                        : 0,
                ];
            })
            ->sortBy('employee_name')
            ->values();

        return [
            'from' => $from,
            'to' => $to,
            'staff' => $rows,
        ];
    }

    public function payrollReport(array $filters): array
    {
        $query = Payroll::query()
            ->withCount('payslips')
            ->when($filters['month'] ?? null, fn (Builder $q) => $q->byMonth($filters['month']))
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->orderByDesc('month')
            ->orderByDesc('id');

        $payrolls = (clone $query)->get()->map(fn (Payroll $p) => [
            'id' => $p->id,
            'payroll_no' => $p->payroll_no,
            'month' => $p->month,
            'status' => $p->status,
            'gross_total' => (float) $p->gross_total,
            'deductions_total' => (float) $p->deductions_total,
            'net_total' => (float) $p->net_total,
            'employees' => $p->payslips_count,
        ]);

        return [
            'payrolls' => $payrolls,
            'totals' => [
                'gross' => (float) (clone $query)->sum('gross_total'),
                'deductions' => (float) (clone $query)->sum('deductions_total'),
                'net' => (float) (clone $query)->sum('net_total'),
            ],
        ];
    }

    public function exportEmployees(array $filters): array
    {
        $rows = Employee::query()
            ->with(['user', 'department', 'position'])
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->when($filters['department_id'] ?? null, fn (Builder $q) => $q->byDepartment((int) $filters['department_id']))
            ->orderBy('employee_id')
            ->get();

        $data = [];
        foreach ($rows as $employee) {
            $data[] = [
                'employee_id' => $employee->employee_id,
                'name' => $employee->user?->name ?? '',
                'email' => $employee->user?->email ?? '',
                'phone' => $employee->user?->phone ?? '',
                'department' => $employee->department?->name ?? '',
                'position' => $employee->position?->name ?? '',
                'employment_type' => $employee->employment_type,
                'hire_date' => $employee->hire_date?->format('Y-m-d') ?? '',
                'status' => $employee->status,
                'salary' => $employee->salary ?? '',
            ];
        }

        return $data;
    }

    public function exportLeave(array $filters): array
    {
        $rows = LeaveRequest::query()
            ->with('employee.user')
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->when($filters['from'] ?? null, fn (Builder $q) => $q->whereDate('start_date', '>=', $filters['from']))
            ->when($filters['to'] ?? null, fn (Builder $q) => $q->whereDate('end_date', '<=', $filters['to']))
            ->orderByDesc('start_date')
            ->get();

        $data = [];
        foreach ($rows as $leave) {
            $data[] = [
                'employee_id' => $leave->employee?->employee_id ?? '',
                'employee' => $leave->employee?->user?->name ?? '',
                'leave_type' => $leave->leave_type,
                'start_date' => $leave->start_date->format('Y-m-d'),
                'end_date' => $leave->end_date->format('Y-m-d'),
                'days' => $leave->days,
                'reason' => $leave->reason ?? '',
                'status' => $leave->status,
                'reviewed_at' => $leave->reviewed_at?->toDateString() ?? '',
            ];
        }

        return $data;
    }

    public function exportAttendance(array $filters): array
    {
        $report = $this->attendanceReport($filters);
        $data = [];
        foreach ($report['staff'] as $row) {
            $data[] = [
                'employee_id' => $row['employee_code'],
                'employee' => $row['employee_name'],
                'department' => $row['department'],
                'present' => $row['present'],
                'absent' => $row['absent'],
                'late' => $row['late'],
                'half_day' => $row['half_day'],
                'leave' => $row['leave'],
                'total' => $row['total'],
                'rate' => $row['rate'],
            ];
        }

        return $data;
    }

    public function manualPaginate(Collection $rows, array $filters): LengthAwarePaginator
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

    public function searchEmployees(string $term): Collection
    {
        return Employee::query()
            ->with(['user', 'department', 'position'])
            ->where('employee_id', 'like', "%{$term}%")
            ->orWhereHas('user', function (Builder $q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%");
            })
            ->active()
            ->orderBy('employee_id')
            ->get();
    }

    private function countAttendance(int $employeeId, string $status): int
    {
        return StaffAttendance::where('employee_id', $employeeId)
            ->where('attendance_date', '>=', now()->startOfMonth()->toDateString())
            ->where('status', $status)
            ->count();
    }
}
