<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Spatie\Permission\Models\Role;

class RolePolicy
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
        return $user->hasPermissionTo('view_roles') || $user->isAdmin();
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('view_roles') || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_roles') || $user->isAdmin();
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('update_roles') || $user->isAdmin();
    }

    public function delete(User $user, Role $role): bool
    {
        return ($user->hasPermissionTo('delete_roles') || $user->isAdmin()) && $role->name !== 'super_admin';
    }
}
