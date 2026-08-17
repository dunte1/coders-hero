<?php

namespace App\Services\Finance;

use App\Models\Fee;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Record a payment against an invoice. Amount must not exceed the balance.
     * The invoice status is always recomputed from recorded payments (never trusted from input).
     */
    public function recordForInvoice(User $user, Invoice $invoice, float $amount, string $method, ?string $reference, ?string $paidAt = null): Payment
    {
        if ($invoice->isPaid() || $invoice->isVoid()) {
            throw new \RuntimeException('This invoice cannot accept payments.', 422);
        }

        $balance = $invoice->balance;

        if ($amount <= 0 || $amount > $balance) {
            throw new \RuntimeException('Amount exceeds the outstanding balance.', 422);
        }

        return DB::transaction(function () use ($user, $invoice, $amount, $method, $reference, $paidAt) {
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'receipt_no' => 'RCPT-' . strtoupper(Str::random(10)),
                'amount' => $amount,
                'method' => $method,
                'reference' => $reference,
                'paid_at' => $paidAt ?: now()->toDateString(),
                'paid_by_user_id' => $user->id,
            ]);

            $invoice->recalculateFromPayments();

            return $payment;
        });
    }

    public function recordForFee(User $user, Fee $fee, float $amount, string $method, ?string $reference, ?string $paidAt = null): Payment
    {
        if ($fee->isPaid()) {
            throw new \RuntimeException('This fee has already been paid.', 422);
        }

        $outstanding = max(0, (float) $fee->amount - (float) $fee->payments()->sum('amount'));

        if ($amount <= 0 || $amount > $outstanding) {
            throw new \RuntimeException('Amount exceeds the outstanding balance.', 422);
        }

        return DB::transaction(function () use ($user, $fee, $amount, $method, $reference, $paidAt) {
            $payment = Payment::create([
                'fee_id' => $fee->id,
                'receipt_no' => 'RCPT-' . strtoupper(Str::random(10)),
                'amount' => $amount,
                'method' => $method,
                'reference' => $reference,
                'paid_at' => $paidAt ?: now()->toDateString(),
                'paid_by_user_id' => $user->id,
            ]);

            if ((float) $fee->payments()->sum('amount') >= (float) $fee->amount) {
                $fee->update(['status' => 'paid']);
            }

            return $payment;
        });
    }

    /**
     * Reverse a payment and restore the payable status (staff only).
     */
    public function reverse(Payment $payment): void
    {
        $invoice = $payment->invoice;

        DB::transaction(function () use ($payment, $invoice) {
            $payment->delete();

            if ($invoice) {
                $invoice->recalculateFromPayments();
            }
        });
    }
}
