<?php

namespace App\Policies;

use App\Models\PerformanceReview;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PerformanceReviewPolicy
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
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function view(User $user, PerformanceReview $review): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin', 'hr_officer'])) {
            return true;
        }

        $employee = $user->employee;
        return $employee && $review->employee_id === $employee->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function update(User $user, PerformanceReview $review): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function delete(User $user, PerformanceReview $review): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}
