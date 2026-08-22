<?php

namespace App\Jobs;

use App\Models\Admission;
use App\Notifications\AdmissionConfirmationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAdmissionConfirmationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public Admission $admission
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        if (!$this->admission->email) {
            return;
        }

        try {
            \Illuminate\Support\Facades\Mail::to($this->admission->email)->send(
                new AdmissionConfirmationNotification($this->admission)
            );

            activity()
                ->performedOn($this->admission)
                ->event('admission_confirmation_sent')
                ->withProperties([
                    'email' => $this->admission->email,
                    'application_number' => $this->admission->application_number,
                ])
                ->log('Admission confirmation email sent');
        } catch (\Throwable $e) {
            Log::error("Failed to send admission confirmation to {$this->admission->email}: {$e->getMessage()}");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendAdmissionConfirmationJob failed for admission {$this->admission->id}: {$exception->getMessage()}");
    }
}
