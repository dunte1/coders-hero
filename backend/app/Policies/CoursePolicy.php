<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CoursePolicy
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
        return true;
    }

    public function view(User $user, Course $course): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'instructor']);
    }

    public function update(User $user, Course $course): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return true;
        }

        return $course->instructor_id === $user->id;
    }

    public function delete(User $user, Course $course): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return true;
        }

        return $course->instructor_id === $user->id;
    }

    public function publish(User $user, Course $course): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return true;
        }

        return $course->instructor_id === $user->id;
    }

    public function archive(User $user, Course $course): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return true;
        }

        return $course->instructor_id === $user->id;
    }

    public function reorder(User $user, Course $course): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return true;
        }

        return $course->instructor_id === $user->id;
    }
}
