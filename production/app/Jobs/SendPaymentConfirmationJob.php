<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\User;
use App\Notifications\PaymentConfirmationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPaymentConfirmationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public Payment $payment,
        public ?User $recipient = null
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $user = $this->recipient;

        if (!$user) {
            $user = $this->resolveRecipient();
        }

        if (!$user || !$user->email) {
            return;
        }

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(
                new PaymentConfirmationNotification($this->payment)
            );

            activity()
                ->performedOn($this->payment)
                ->event('payment_confirmation_sent')
                ->withProperties([
                    'email' => $user->email,
                    'receipt_no' => $this->payment->receipt_no,
                    'amount' => $this->payment->amount,
                ])
                ->log('Payment confirmation email sent');
        } catch (\Throwable $e) {
            Log::error("Failed to send payment confirmation to {$user->email}: {$e->getMessage()}");
        }
    }

    private function resolveRecipient(): ?User
    {
        if ($this->payment->paid_by_user_id) {
            return User::find($this->payment->paid_by_user_id);
        }

        $student = $this->payment->invoice?->student ?? $this->payment->fee?->student;

        if ($student && $student->user_id) {
            return User::find($student->user_id);
        }

        $guardian = $student?->guardian;

        if ($guardian && $guardian->user_id) {
            return User::find($guardian->user_id);
        }

        return null;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendPaymentConfirmationJob failed for payment {$this->payment->id}: {$exception->getMessage()}");
    }
}
