<?php

namespace App\Policies;

use App\Models\Guardian;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GuardianPolicy
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
        return $user->hasPermissionTo('view_guardians') || $user->isAdmin();
    }

    public function view(User $user, Guardian $guardian): bool
    {
        return $user->hasPermissionTo('view_guardians') || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_guardians') || $user->isAdmin();
    }

    public function update(User $user, Guardian $guardian): bool
    {
        return $user->hasPermissionTo('update_guardians') || $user->isAdmin();
    }

    public function delete(User $user, Guardian $guardian): bool
    {
        return $user->hasPermissionTo('delete_guardians') || $user->isAdmin();
    }
}
