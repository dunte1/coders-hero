<?php

namespace App\Services\Parents;

use App\Models\Guardian;
use App\Models\Student;
use App\Models\User;

class ParentPortalService
{
    public function guardianForUser(?User $user = null): ?Guardian
    {
        return ($user ?? auth()->user())?->guardian;
    }

    public function isAdministrator(?User $user = null): bool
    {
        return ($user ?? auth()->user())?->hasAnyRole(['admin', 'super_admin']) ?? false;
    }

    /**
     * @return array<int>
     */
    public function accessibleStudentIds(?User $user = null): array
    {
        $user = $user ?? auth()->user();

        if ($this->isAdministrator($user)) {
            return Student::pluck('id')->all();
        }

        $guardian = $this->guardianForUser($user);

        if (!$guardian) {
            return [];
        }

        return $guardian->students()->pluck('students.id')->all();
    }

    public function hasAccessToStudent(int $studentId, ?User $user = null): bool
    {
        return in_array($studentId, $this->accessibleStudentIds($user), true);
    }

    /**
     * Students visible to the current user, optionally filtered by grade/status.
     */
    public function accessibleStudents(?User $user = null, array $filters = [])
    {
        $query = Student::query();

        if (!$this->isAdministrator($user)) {
            $guardian = $this->guardianForUser($user);
            if (!$guardian) {
                return collect();
            }
            $query->where('guardian_id', $guardian->id);
        }

        if (!empty($filters['grade']) && $filters['grade'] !== 'all') {
            $query->where('grade', $filters['grade']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('first_name')->get();
    }
}
