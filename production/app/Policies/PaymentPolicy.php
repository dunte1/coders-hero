<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaymentPolicy
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
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin', 'accountant'])) {
            return true;
        }

        $student = \App\Models\Student::where('user_id', $user->id)->first();
        if ($student && $payment->invoice_id && $student->id === $payment->invoice->student_id) {
            return true;
        }

        return $user->guardian?->students()->where('students.id', $payment->invoice->student_id)->exists() ?? false;
    }

    public function reverse(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }
}
