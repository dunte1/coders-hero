<?php

namespace App\Policies;

use App\Models\Admission;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AdmissionPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Admission $admission): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Admission $admission): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Admission $admission): bool
    {
        return $user->isAdmin();
    }

    public function admit(User $user, Admission $admission): bool
    {
        return $user->isAdmin();
    }
}
