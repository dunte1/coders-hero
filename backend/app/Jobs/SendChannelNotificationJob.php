<?php

namespace App\Jobs;

use App\Models\NotificationDelivery;
use App\Services\Notifications\Channels\EmailChannel;
use App\Services\Notifications\Channels\InAppChannel;
use App\Services\Notifications\Channels\PushChannel;
use App\Services\Notifications\Channels\SmsChannel;
use App\Services\Notifications\Channels\WhatsAppChannel;
use App\Services\Notifications\Contracts\NotificationChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendChannelNotificationJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $timeout = 60;

    public function __construct(public int $deliveryId) {}

    public function uniqueId(): string
    {
        return (string) $this->deliveryId;
    }

    public function handle(): void
    {
        $delivery = NotificationDelivery::with('notification')->find($this->deliveryId);

        if (!$delivery || $delivery->isCompleted()) {
            return;
        }

        $delivery->update([
            'retry_count' => $delivery->retry_count + 1,
            'last_retried_at' => now(),
            'status' => 'sending',
            'sent_at' => $delivery->sent_at ?? now(),
        ]);

        try {
            $channel = $this->resolveChannel($delivery->channel);
            $result = $channel->send($delivery);

            $delivery->markDelivered($result['reference'] ?? null);
        } catch (Throwable $e) {
            Log::warning(
                "Notification delivery failed (delivery={$delivery->id}, channel={$delivery->channel}, attempt={$delivery->retry_count}): {$e->getMessage()}"
            );

            $maxAttempts = (int) config('notifications.retry.max_attempts', 3);

            if ($delivery->retry_count < $maxAttempts) {
                $delivery->markQueued();

                if (config('queue.default') !== 'sync') {
                    $this->scheduleRetry($delivery);
                }
            } else {
                $delivery->markFailed($e->getMessage());
            }
        }
    }

    private function scheduleRetry(NotificationDelivery $delivery): void
    {
        $base = (int) config('notifications.retry.backoff', 60);
        $multiplier = (int) config('notifications.retry.backoff_multiplier', 2);
        $delay = $base * ($multiplier ** ($delivery->retry_count - 1));

        self::dispatch($this->deliveryId)
            ->onQueue('notifications')
            ->delay(now()->addSeconds($delay));
    }

    private function resolveChannel(string $channel): NotificationChannel
    {
        return match ($channel) {
            'email' => app(EmailChannel::class),
            'sms' => app(SmsChannel::class),
            'push' => app(PushChannel::class),
            'whatsapp' => app(WhatsAppChannel::class),
            default => app(InAppChannel::class),
        };
    }
}
