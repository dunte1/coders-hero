<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\User;
use App\Notifications\PaymentReceivedAdminNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyAdminsPaymentReceivedJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public Payment $payment
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        try {
            $admins = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['super_admin', 'admin', 'director', 'school_admin', 'accountant']);
            })->where('is_active', true)->get();

            foreach ($admins as $admin) {
                if ($admin->email) {
                    \Illuminate\Support\Facades\Mail::to($admin->email)->send(
                        new PaymentReceivedAdminNotification($this->payment)
                    );
                }
            }

            activity()
                ->performedOn($this->payment)
                ->event('admin_notified_payment_received')
                ->withProperties([
                    'receipt_no' => $this->payment->receipt_no,
                    'amount' => $this->payment->amount,
                    'admins_notified' => $admins->count(),
                ])
                ->log('Admins notified of payment received');
        } catch (\Throwable $e) {
            Log::error("Failed to notify admins of payment {$this->payment->id}: {$e->getMessage()}");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("NotifyAdminsPaymentReceivedJob failed for payment {$this->payment->id}: {$exception->getMessage()}");
    }
}
