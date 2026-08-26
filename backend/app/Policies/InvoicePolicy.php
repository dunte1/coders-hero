<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InvoicePolicy
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

    public function view(User $user, Invoice $invoice): bool
    {
        if ($user->hasAnyRole(['admin', 'super_admin', 'accountant'])) {
            return true;
        }

        $student = \App\Models\Student::where('user_id', $user->id)->first();
        if ($student && $student->id === $invoice->student_id) {
            return true;
        }

        return $user->guardian?->students()->where('students.id', $invoice->student_id)->exists() ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']) && $invoice->status === 'draft';
    }

    public function issue(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function void(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin']);
    }

    public function recordPayment(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }

    public function generate(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'accountant']);
    }
}
