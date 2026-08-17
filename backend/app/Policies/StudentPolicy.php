<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StudentPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function uploadPhoto(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function promote(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function transfer(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }

    public function graduate(User $user, Student $student): bool
    {
        return $user->isAdmin();
    }
}
