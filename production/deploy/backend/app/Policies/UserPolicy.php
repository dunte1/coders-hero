<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
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
        return $user->hasPermissionTo('view_users') || $user->isAdmin();
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasPermissionTo('view_users') || $user->isAdmin() || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_users') || $user->isAdmin();
    }

    public function update(User $user, User $model): bool
    {
        return ($user->hasPermissionTo('update_users') || $user->isAdmin()) && $user->id !== $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        return ($user->hasPermissionTo('delete_users') || $user->isAdmin()) && $user->id !== $model->id;
    }

    public function assignRole(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    public function removeRole(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    public function toggleStatus(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }

    public function restore(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }

    public function forceDelete(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }
}
