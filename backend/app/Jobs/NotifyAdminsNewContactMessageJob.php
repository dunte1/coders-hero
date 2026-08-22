<?php

namespace App\Jobs;

use App\Models\ContactMessage;
use App\Models\User;
use App\Notifications\AdminNewContactMessageNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyAdminsNewContactMessageJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public ContactMessage $message
    ) {
        $this->onQueue('emails');
    }

    public function handle(): void
    {
        try {
            $admins = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['super_admin', 'admin', 'director', 'school_admin']);
            })->where('is_active', true)->get();

            foreach ($admins as $admin) {
                $admin->notify(new AdminNewContactMessageNotification($this->message));
            }

            activity()
                ->performedOn($this->message)
                ->event('admin_notified_new_contact_message')
                ->withProperties([
                    'from' => $this->message->email,
                    'subject' => $this->message->subject,
                    'admins_notified' => $admins->count(),
                ])
                ->log('Admins notified of new contact message');
        } catch (\Throwable $e) {
            Log::error("Failed to notify admins of contact message {$this->message->id}: {$e->getMessage()}");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("NotifyAdminsNewContactMessageJob failed for message {$this->message->id}: {$exception->getMessage()}");
    }
}
