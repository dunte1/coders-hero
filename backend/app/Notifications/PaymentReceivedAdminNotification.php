<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class PaymentReceivedAdminNotification extends BrandedNotification
{
    public function __construct(
        public Payment $payment
    ) {
        $this->payment->loadMissing(['invoice.student', 'fee.student', 'mpesaTransaction', 'paidBy']);
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();
        $student = $this->payment->invoice?->student ?? $this->payment->fee?->student;
        $studentName = $student?->full_name ?? 'Unknown Student';
        $receiptNo = $this->payment->receipt_no;
        $amount = number_format((float) $this->payment->amount, 2);
        $method = ucfirst(str_replace('_', ' ', $this->payment->method));
        $reference = $this->payment->mpesaTransaction?->mpesa_receipt_number ?? $this->payment->reference;
        $paidOn = $this->payment->paid_at?->format('M j, Y g:i A') ?? now()->format('M j, Y g:i A');
        $invoiceNo = $this->payment->invoice?->invoice_no ?? $this->payment->fee?->label ?? 'N/A';
        $paidByName = $this->payment->paidBy?->name ?? 'N/A';
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        $lines = [
            "A payment has been received. Here are the details:",
            "",
            "**Receipt Number:** {$receiptNo}",
            "**Amount:** KES {$amount}",
            "**Method:** {$method}",
        ];

        if ($reference) {
            $lines[] = "**M-Pesa Reference:** {$reference}";
        }

        $lines[] = "**Invoice/Fee:** {$invoiceNo}";
        $lines[] = "**Student:** {$studentName}";
        $lines[] = "**Paid By:** {$paidByName}";
        $lines[] = "**Date:** {$paidOn}";

        return $this->brandedMail(
            "Payment Received - {$siteName}",
            "Hello Admin!",
            $lines,
            $frontendUrl . '/finance/mpesa/transactions',
            'View Transactions'
        );
    }
}
