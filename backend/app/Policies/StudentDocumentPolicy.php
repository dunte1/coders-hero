<?php

namespace App\Policies;

use App\Models\StudentDocument;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StudentDocumentPolicy
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
        return $user->hasPermissionTo('view_student_documents') || $user->isAdmin();
    }

    public function view(User $user, StudentDocument $document): bool
    {
        return $user->hasPermissionTo('view_student_documents') || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('upload_student_documents') || $user->isAdmin();
    }

    public function delete(User $user, StudentDocument $document): bool
    {
        return $user->hasPermissionTo('delete_student_documents') || $user->isAdmin();
    }
}
