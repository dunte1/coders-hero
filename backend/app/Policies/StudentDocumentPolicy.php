<?php

namespace App\Policies;

use App\Models\StudentDocument;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StudentDocumentPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, StudentDocument $document): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, StudentDocument $document): bool
    {
        return $user->isAdmin();
    }
}
