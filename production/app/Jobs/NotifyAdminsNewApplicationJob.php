<?php

namespace App\Jobs;

use App\Models\Admission;
use App\Models\User;
use App\Notifications\AdminNewApplicationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NotifyAdminsNewApplicationJob implements ShouldQueue
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
        try {
            $admins = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['super_admin', 'admin', 'director', 'school_admin']);
            })->where('is_active', true)->get();

            foreach ($admins as $admin) {
                $admin->notify(new AdminNewApplicationNotification($this->admission));
            }

            activity()
                ->performedOn($this->admission)
                ->event('admin_notified_new_application')
                ->withProperties([
                    'application_number' => $this->admission->application_number,
                    'admins_notified' => $admins->count(),
                ])
                ->log('Admins notified of new application');
        } catch (\Throwable $e) {
            Log::error("Failed to notify admins of new application {$this->admission->id}: {$e->getMessage()}");
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("NotifyAdminsNewApplicationJob failed for admission {$this->admission->id}: {$exception->getMessage()}");
    }
}
