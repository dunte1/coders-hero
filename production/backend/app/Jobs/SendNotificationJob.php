<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNotificationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public string $userId,
        public string $title,
        public string $body,
        public string $type = 'general'
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $user = User::find($this->userId);

        if (!$user) {
            return;
        }

        $user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'type' => $this->type,
            'data' => [
                'title' => $this->title,
                'body' => $this->body,
            ],
        ]);

        \Illuminate\Support\Facades\Log::info("Notification sent to {$user->email}: {$this->title}");
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("Failed to send notification to user {$this->userId}: {$exception->getMessage()}");
    }
}
