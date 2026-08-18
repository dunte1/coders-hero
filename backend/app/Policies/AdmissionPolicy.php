<?php

namespace App\Policies;

use App\Models\Admission;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AdmissionPolicy
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
        return $user->hasPermissionTo('view_admissions') || $user->isAdmin();
    }

    public function view(User $user, Admission $admission): bool
    {
        return $user->hasPermissionTo('view_admissions') || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_admissions') || $user->isAdmin();
    }

    public function update(User $user, Admission $admission): bool
    {
        return $user->hasPermissionTo('update_admissions') || $user->isAdmin();
    }

    public function delete(User $user, Admission $admission): bool
    {
        return $user->hasPermissionTo('delete_admissions') || $user->isAdmin();
    }

    public function admit(User $user, Admission $admission): bool
    {
        return $user->hasPermissionTo('update_admissions') || $user->isAdmin();
    }
}
