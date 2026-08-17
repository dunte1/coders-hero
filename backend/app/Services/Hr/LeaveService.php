<?php

namespace App\Services\Hr;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class LeaveService
{
    public function __construct(
        private HrService $hrService
    ) {}

    public function index(array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = LeaveRequest::query()
            ->with(['employee.user', 'employee.department', 'reviewedBy'])
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->when($filters['leave_type'] ?? null, fn (Builder $q) => $q->byType($filters['leave_type']))
            ->when($filters['employee_id'] ?? null, fn (Builder $q) => $q->where('employee_id', (int) $filters['employee_id']))
            ->when($filters['from'] ?? null, fn (Builder $q) => $q->whereDate('start_date', '>=', $filters['from']))
            ->when($filters['to'] ?? null, fn (Builder $q) => $q->whereDate('end_date', '<=', $filters['to']))
            ->when($filters['search'] ?? null, function (Builder $q) use ($filters) {
                $term = $filters['search'];
                $q->where(function (Builder $sub) use ($term) {
                    $sub->whereHas('employee.user', fn (Builder $u) => $u->where('name', 'like', "%{$term}%"))
                        ->orWhereHas('employee', fn (Builder $e) => $e->where('employee_id', 'like', "%{$term}%"));
                });
            });

        return $query->orderByDesc('start_date')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function show(int $id): LeaveRequest
    {
        return LeaveRequest::with(['employee.user', 'employee.department', 'requestedBy', 'reviewedBy'])
            ->findOrFail($id);
    }

    public function store(array $data, User $user): LeaveRequest
    {
        $employee = Employee::findOrFail($data['employee_id']);
        $days = $this->computeDays($data['start_date'], $data['end_date']);

        if ($days < 1) {
            throw new \RuntimeException('End date must be on or after the start date.', 422);
        }

        if ($this->hasOverlap($data['employee_id'], $data['start_date'], $data['end_date'])) {
            throw new \RuntimeException('This employee already has a leave request overlapping these dates.', 422);
        }

        if ($data['leave_type'] === 'annual' && !$this->hasSufficientBalance($employee, $days, $data['start_date'])) {
            throw new \RuntimeException('The employee does not have enough annual leave balance for these dates.', 422);
        }

        return LeaveRequest::create([
            'employee_id' => $data['employee_id'],
            'leave_type' => $data['leave_type'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'days' => $days,
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
            'requested_by_user_id' => $user->id,
        ]);
    }

    public function review(int $id, string $status, string $note, User $user): LeaveRequest
    {
        $leave = LeaveRequest::with('employee')->findOrFail($id);

        if ($leave->status !== 'pending') {
            throw new \RuntimeException('Only pending leave requests can be reviewed.', 422);
        }

        $leave->update([
            'status' => $status,
            'reviewed_by_user_id' => $user->id,
            'reviewed_at' => now(),
            'review_note' => $note ?: null,
        ]);

        if ($status === 'approved') {
            $leave->employee->update(['status' => 'on_leave']);
        }

        return $leave->fresh(['employee.user', 'reviewedBy']);
    }

    public function cancel(int $id, ?User $user = null): LeaveRequest
    {
        $leave = LeaveRequest::findOrFail($id);

        if (!in_array($leave->status, ['pending', 'approved'])) {
            throw new \RuntimeException('This leave request can no longer be cancelled.', 422);
        }

        $wasApproved = $leave->status === 'approved';

        $leave->update(['status' => 'cancelled']);

        if ($wasApproved) {
            $this->refreshEmployeeStatus($leave->employee_id);
        }

        return $leave->fresh(['employee.user']);
    }

    public function myLeaves(int $employeeId, array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return LeaveRequest::with(['reviewedBy'])
            ->where('employee_id', $employeeId)
            ->when($filters['status'] ?? null, fn (Builder $q) => $q->byStatus($filters['status']))
            ->orderByDesc('start_date')
            ->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function myBalance(int $employeeId): array
    {
        $used = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->where('leave_type', 'annual')
            ->whereYear('start_date', now()->year)
            ->sum('days');

        return [
            'allowance' => HrService::ANNUAL_LEAVE_ALLOWANCE,
            'used' => (int) $used,
            'remaining' => max(0, HrService::ANNUAL_LEAVE_ALLOWANCE - (int) $used),
        ];
    }

    private function computeDays(string $start, string $end): int
    {
        return (int) \Carbon\Carbon::parse($start)->diffInDays(\Carbon\Carbon::parse($end)) + 1;
    }

    private function hasOverlap(int $employeeId, string $start, string $end): bool
    {
        return LeaveRequest::where('employee_id', $employeeId)
            ->whereIn('status', ['pending', 'approved'])
            ->whereDate('start_date', '<=', $end)
            ->whereDate('end_date', '>=', $start)
            ->exists();
    }

    private function hasSufficientBalance(Employee $employee, int $days, string $startDate): bool
    {
        $used = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->where('leave_type', 'annual')
            ->whereYear('start_date', \Carbon\Carbon::parse($startDate)->year)
            ->sum('days');

        return ((int) $used) + $days <= HrService::ANNUAL_LEAVE_ALLOWANCE;
    }

    private function refreshEmployeeStatus(int $employeeId): void
    {
        $hasActiveLeave = LeaveRequest::where('employee_id', $employeeId)
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', now()->toDateString())
            ->whereDate('end_date', '>=', now()->toDateString())
            ->exists();

        $employee = Employee::find($employeeId);
        if ($employee) {
            $employee->update(['status' => $hasActiveLeave ? 'on_leave' : 'active']);
        }
    }

    public function currentApprovedLeaveEmployeeIds(): Collection
    {
        return LeaveRequest::where('status', 'approved')
            ->whereDate('start_date', '<=', now()->toDateString())
            ->whereDate('end_date', '>=', now()->toDateString())
            ->pluck('employee_id');
    }
}
