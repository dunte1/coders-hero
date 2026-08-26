<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EmployeePolicy
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

    public function view(User $user, Employee $employee): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin', 'hr_officer'])) {
            return true;
        }

        return $employee->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function onboard(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function offboard(User $user, Employee $employee): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}
