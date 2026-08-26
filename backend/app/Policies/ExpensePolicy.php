<?php

namespace App\Policies;

use App\Models\Expense;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ExpensePolicy
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
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function view(User $user, Expense $expense): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function update(User $user, Expense $expense): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function approve(User $user, Expense $expense): bool
    {
        if (! $user->hasAnyRole(['admin', 'super_admin'])) {
            return false;
        }

        if ($expense->recorded_by_user_id === $user->id) {
            return false;
        }

        return true;
    }

    public function reject(User $user, Expense $expense): bool
    {
        if (! $user->hasAnyRole(['admin', 'super_admin'])) {
            return false;
        }

        if ($expense->recorded_by_user_id === $user->id) {
            return false;
        }

        return true;
    }
}
