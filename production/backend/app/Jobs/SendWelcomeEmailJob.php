<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmailJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public User $user
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        $this->user->notify(new \App\Notifications\WelcomeNotification($this->user));

        activity()
            ->performedOn($this->user)
            ->event('welcome_email_sent')
            ->withProperties([
                'email' => $this->user->email,
                'name' => $this->user->name,
            ])
            ->log('Welcome email sent to user');
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("Failed to send welcome email to {$this->user->email}: {$exception->getMessage()}");
    }
}
