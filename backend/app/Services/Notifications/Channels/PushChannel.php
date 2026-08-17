<?php

namespace App\Services\Notifications\Channels;

use App\Models\NotificationDelivery;
use App\Models\User;
use App\Models\UserFcmToken;
use App\Services\Notifications\Contracts\NotificationChannel;
use App\Services\Notifications\FcmGateway;
use RuntimeException;
use Throwable;

class PushChannel implements NotificationChannel
{
    public function __construct(private FcmGateway $gateway) {}

    public function send(NotificationDelivery $delivery): array
    {
        $notification = $delivery->notification;

        if (!$notification || !$notification->notifiable instanceof User) {
            throw new RuntimeException('Push notification has no valid recipient.');
        }

        $user = $notification->notifiable;
        $tokens = $user->fcmTokens()->active()->get();

        if ($tokens->isEmpty()) {
            return ['success' => true, 'reference' => null];
        }

        $data = $notification->data ?? [];
        $title = $data['title'] ?? 'Notification';
        $body = $data['body'] ?? '';
        $link = $notification->link;

        $lastReference = null;
        $failures = 0;

        foreach ($tokens as $token) {
            try {
                $result = $this->gateway->send($token->token, $title, $body, $link ? ['link' => $link] : []);
                $lastReference = $result['message_id'] ?? $lastReference;
                $this->touchToken($token);
            } catch (Throwable $e) {
                $failures++;

                if (str_contains($e->getMessage(), 'registration-token-not-found') ||
                    str_contains($e->getMessage(), 'UNREGISTERED')) {
                    $token->revoke();
                }
            }
        }

        if ($failures === $tokens->count()) {
            throw new RuntimeException('Push delivery failed for all registered devices.');
        }

        return ['success' => true, 'reference' => $lastReference];
    }

    private function touchToken(UserFcmToken $token): void
    {
        $token->update(['last_used_at' => now()]);
    }
}
