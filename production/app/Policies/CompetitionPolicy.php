<?php

namespace App\Policies;

use App\Models\Competition;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CompetitionPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasAnyRole(['super_admin', 'admin'])) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Competition $competition): bool
    {
        if ($user->hasAnyRole(['director', 'branch_manager', 'school_admin', 'teacher'])) {
            return true;
        }

        if ($competition->judges()->where('users.id', $user->id)->exists()) {
            return true;
        }

        return in_array($competition->status, ['registration_open', 'registration_closed', 'ongoing', 'completed'], true);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['director', 'branch_manager', 'school_admin', 'teacher']);
    }

    public function update(User $user, Competition $competition): bool
    {
        return $user->hasAnyRole(['director', 'branch_manager', 'school_admin', 'teacher']);
    }

    public function delete(User $user, Competition $competition): bool
    {
        if ($competition->status === 'completed') {
            return false;
        }

        return $user->hasAnyRole(['director', 'branch_manager', 'school_admin', 'teacher']);
    }

    public function judge(User $user, Competition $competition): bool
    {
        if ($user->hasAnyRole(['director', 'branch_manager', 'school_admin', 'teacher'])) {
            return true;
        }

        return $competition->judges()->where('users.id', $user->id)->exists();
    }
}
