<?php

namespace App\Services\Finance;

use App\Models\Fee;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\Pdf\DocumentPdfService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentService
{
    public function __construct(
        private DocumentPdfService $pdf
    ) {}

    /**
     * Build a branded payment receipt PDF (shared by admin + parent portal).
     */
    public function receiptPdf(Payment $payment): StreamedResponse
    {
        $payment->loadMissing(['invoice.student', 'fee.student', 'paidBy:id,name', 'mpesaTransaction']);

        $student = $payment->invoice?->student ?? $payment->fee?->student;
        $invoiceNo = $payment->invoice?->invoice_no ?? ($payment->fee?->label ?? null);
        $reference = $payment->mpesaTransaction?->mpesa_receipt ?? $payment->reference;

        $details = $this->pdf->detailsBox([
            'Receipt No' => $payment->receipt_no,
            'Student' => $student ? $student->full_name . ' (' . $student->student_id . ')' : '—',
            'Invoice' => $invoiceNo ?? '—',
            'Amount Paid' => number_format((float) $payment->amount, 2),
            'Method' => ucfirst(str_replace('_', ' ', $payment->method)),
            'Reference' => $reference,
            'Paid On' => $payment->paid_at?->format('M j, Y g:i A'),
            'Received By' => $payment->paidBy?->name,
        ]);

        $content = '<div class="doc-section"><div class="doc-section-title">Payment Receipt</div>' . $details . '</div>'
            . '<p class="mt-4"><span class="doc-badge">' . ucfirst($payment->method) . ' Payment</span></p>'
            . '<p class="text-muted mt-2">This receipt confirms the payment above. Please retain it for your records.</p>';

        return $this->pdf->download(
            'Payment Receipt',
            $content,
            $payment->receipt_no . '.pdf',
            ['document_no' => $payment->receipt_no]
        );
    }

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
