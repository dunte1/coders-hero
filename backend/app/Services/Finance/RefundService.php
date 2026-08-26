<?php

namespace App\Services\Finance;

use App\Models\Refund;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function requestRefund(array $data): Refund
    {
        $payment = Payment::findOrFail($data['payment_id']);

        if ((float) $data['amount'] > (float) $payment->amount) {
            throw new \RuntimeException('Refund amount exceeds the original payment.', 422);
        }

        return Refund::create([
            'payment_id' => $data['payment_id'],
            'user_id' => auth()->id(),
            'amount' => $data['amount'],
            'reason' => $data['reason'],
            'status' => 'pending',
        ]);
    }

    public function approveRefund(int $id, ?string $notes = null): Refund
    {
        $refund = Refund::with('payment')->findOrFail($id);
        $payment = $refund->payment;

        if (!$payment) {
            throw new \RuntimeException('Original payment not found.', 422);
        }

        DB::transaction(function () use ($refund, $payment, $notes) {
            $refund->update([
                'status' => 'approved',
                'admin_notes' => $notes,
                'processed_at' => now(),
            ]);

            app(PaymentService::class)->reverse($payment, 'Refund #' . $refund->id);
        });

        return $refund->fresh();
    }

    public function rejectRefund(int $id, ?string $notes = null): Refund
    {
        $refund = Refund::findOrFail($id);
        $refund->update([
            'status' => 'rejected',
            'admin_notes' => $notes,
        ]);
        return $refund->fresh();
    }
}
