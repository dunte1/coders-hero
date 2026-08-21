<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AttendancePolicy
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
        return $user->hasAnyPermissionTo(['view_attendance', 'view_own_attendance']) || $user->isAdmin();
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if ($user->hasRole('student') && $attendance->student_id === $user->student?->id) {
            return $user->hasPermissionTo('view_own_attendance') || $user->isAdmin();
        }

        return $user->hasPermissionTo('view_attendance') || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage_attendance') || $user->isAdmin();
    }

    public function update(User $user, Attendance $attendance): bool
    {
        return $user->hasPermissionTo('manage_attendance') || $user->isAdmin();
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        return $user->hasPermissionTo('manage_attendance') || $user->isAdmin();
    }
}
