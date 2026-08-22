<?php

namespace App\Jobs;

use App\Models\FreeTrialBooking;
use App\Models\User;
use App\Notifications\FreeTrialConfirmationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendFreeTrialConfirmationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public FreeTrialBooking $booking
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        try {
            if ($this->booking->email) {
                \Illuminate\Support\Facades\Mail::to($this->booking->email)->send(
                    new FreeTrialConfirmationNotification($this->booking)
                );
            }

            $admins = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['super_admin', 'admin', 'director', 'school_admin']);
            })->where('is_active', true)->get();

            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\AdminNewFreeTrialNotification($this->booking));
            }

            activity()
                ->performedOn($this->booking)
                ->event('free_trial_confirmation_sent')
                ->withProperties([
                    'parent_email' => $this->booking->email,
                    'child_name' => $this->booking->child_name,
                ])
                ->log('Free trial confirmation sent');
        } catch (\Throwable $e) {
            Log::error("Failed to send free trial confirmation: {$e->getMessage()}");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendFreeTrialConfirmationJob failed: {$exception->getMessage()}");
    }
}
