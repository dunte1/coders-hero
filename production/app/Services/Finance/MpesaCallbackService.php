<?php

namespace App\Services\Finance;

use App\Models\MpesaTransaction;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class MpesaCallbackService
{
    /**
     * Process a Daraja STK callback. Verifies against our stored transaction,
     * is idempotent, records a receipt and reconciles the payable.
     */
    public function handle(array $payload): MpesaTransaction
    {
        $stk = data_get($payload, 'Body.stkCallback', []);
        $checkoutRequestId = $stk['CheckoutRequestID'] ?? null;

        if (!$checkoutRequestId) {
            throw new \RuntimeException('Invalid callback payload.', 422);
        }

        $transaction = MpesaTransaction::where('checkout_request_id', $checkoutRequestId)->lockForUpdate()->first();

        if (!$transaction) {
            activity()->log('Received M-Pesa callback for unknown CheckoutRequestID: ' . $checkoutRequestId);
            throw new \RuntimeException('Unknown transaction.', 404);
        }

        // Idempotency guard: a finalised transaction is never reprocessed.
        if ($transaction->status === 'completed' && $transaction->payment_id !== null) {
            return $transaction->fresh(['payment', 'invoice', 'fee']);
        }

        DB::transaction(function () use ($transaction, $stk, $payload) {
            $transaction->result_code = $stk['ResultCode'] ?? null;
            $transaction->result_desc = $stk['ResultDesc'] ?? null;
            $transaction->raw_payload = $payload;
            $transaction->save();

            if ((int) ($stk['ResultCode'] ?? 1) !== 0) {
                $transaction->status = 'failed';
                $transaction->save();

                return;
            }

            $metadata = collect($stk['CallbackMetadata']['Item'] ?? [])->pluck('Value', 'Name');
            $receipt = $metadata->get('MpesaReceiptNumber');

            if (!$receipt) {
                $transaction->status = 'failed';
                $transaction->save();

                return;
            }

            $transaction->mpesa_receipt_number = $receipt;
            $transaction->amount = $metadata->get('Amount', $transaction->amount);
            $transaction->phone_number = $metadata->get('PhoneNumber', $transaction->phone_number);
            $transaction->transaction_date = $metadata->get('TransactionDate', $transaction->transaction_date);
            $transaction->status = 'completed';
            $transaction->reconciled_at = now();

            $existing = Payment::where('reference', $receipt)->first();

            if (!$existing) {
                $payment = Payment::create([
                    'invoice_id' => $transaction->invoice_id,
                    'fee_id' => $transaction->fee_id,
                    'receipt_no' => 'RCPT-' . $receipt,
                    'amount' => $transaction->amount,
                    'method' => 'mpesa',
                    'reference' => $receipt,
                    'paid_at' => $transaction->transaction_date?->toDateString() ?? now()->toDateString(),
                    'paid_by_user_id' => $transaction->user_id,
                ]);

                $transaction->payment_id = $payment->id;
                $transaction->save();

                $this->reconcilePayable($transaction);
            } else {
                $transaction->payment_id = $existing->id;
                $transaction->save();
            }
        });

        return $transaction->fresh(['payment', 'invoice', 'fee']);
    }

    private function reconcilePayable(MpesaTransaction $transaction): void
    {
        if ($transaction->invoice_id !== null) {
            $transaction->invoice?->recalculateFromPayments();

            return;
        }

        if ($transaction->fee_id !== null) {
            $fee = $transaction->fee;

            if ($fee && (float) $fee->payments()->sum('amount') >= (float) $fee->amount) {
                $fee->update(['status' => 'paid']);
            }
        }
    }
}
