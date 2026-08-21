<?php

namespace App\Services\Competitions;

use App\Models\Competition;
use App\Models\Student;
use App\Models\User;

trait CompetitionAccess
{
    protected function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'teacher', 'instructor']);
    }

    public function studentForUser(User $user): ?Student
    {
        return Student::where('user_id', $user->id)->first();
    }

    protected function canManage(User $user): bool
    {
        return $this->isStaff($user);
    }

    protected function canAccessCompetition(User $user, Competition $competition): bool
    {
        if ($this->isStaff($user)) {
            return true;
        }

        if ($user->hasRole('judge')) {
            return $competition->hasJudge($user->id);
        }

        return $competition->isPublished();
    }
}
