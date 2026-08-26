<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class LeaveRequestPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function view(User $user, LeaveRequest $leave): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin', 'hr_officer'])) {
            return true;
        }

        $employee = $user->employee;
        return $employee && $leave->employee_id === $employee->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']) || $user->employee !== null;
    }

    public function review(User $user, LeaveRequest $leave): bool
    {
        if (! $user->hasAnyRole(['admin', 'super_admin', 'hr_officer'])) {
            return false;
        }

        $employee = $user->employee;
        if ($employee && $leave->employee_id === $employee->id) {
            return false;
        }

        return true;
    }

    public function cancel(User $user, LeaveRequest $leave): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin', 'hr_officer'])) {
            return true;
        }

        $employee = $user->employee;
        return $employee && $leave->employee_id === $employee->id && $leave->status === 'pending';
    }
}
