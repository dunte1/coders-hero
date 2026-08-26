<?php

namespace App\Policies;

use App\Models\FeeStructure;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FeeStructurePolicy
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

    public function view(User $user, FeeStructure $feeStructure): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function update(User $user, FeeStructure $feeStructure): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function delete(User $user, FeeStructure $feeStructure): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}
