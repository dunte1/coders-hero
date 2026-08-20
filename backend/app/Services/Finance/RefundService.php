<?php

namespace App\Services\Finance;

use App\Models\Refund;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function requestRefund(array $data): Refund
    {
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
        $refund = Refund::findOrFail($id);

        DB::transaction(function () use ($refund, $notes) {
            $refund->update([
                'status' => 'approved',
                'admin_notes' => $notes,
                'processed_at' => now(),
            ]);
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
