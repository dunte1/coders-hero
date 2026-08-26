<?php

namespace App\Policies;

use App\Models\Payroll;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PayrollPolicy
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

    public function view(User $user, Payroll $payroll): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'hr_officer']);
    }

    public function run(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function process(User $user, Payroll $payroll): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function markPaid(User $user, Payroll $payroll): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function cancel(User $user, Payroll $payroll): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}
