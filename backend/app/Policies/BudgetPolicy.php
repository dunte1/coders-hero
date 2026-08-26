<?php

namespace App\Policies;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BudgetPolicy
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

    public function view(User $user, Budget $budget): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function update(User $user, Budget $budget): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function delete(User $user, Budget $budget): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}
