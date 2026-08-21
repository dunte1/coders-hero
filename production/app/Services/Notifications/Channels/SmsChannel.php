<?php

namespace App\Services\Notifications\Channels;

use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\Notifications\AfricaTalkingGateway;
use App\Services\Notifications\Contracts\NotificationChannel;
use RuntimeException;

class SmsChannel implements NotificationChannel
{
    public function __construct(private AfricaTalkingGateway $gateway) {}

    public function send(NotificationDelivery $delivery): array
    {
        $notification = $delivery->notification;

        if (!$notification || !$notification->notifiable instanceof User) {
            throw new RuntimeException('SMS notification has no valid recipient.');
        }

        $user = $notification->notifiable;
        $phone = $user->phone;

        if (!is_string($phone) || trim($phone) === '') {
            return ['success' => true, 'reference' => null];
        }

        $data = $notification->data ?? [];
        $message = $data['body'] ?? $data['title'] ?? '';

        $result = $this->gateway->send($phone, $message);

        if (($result['status_code'] ?? null) !== null && (int) $result['status_code'] >= 400) {
            throw new RuntimeException('SMS provider rejected the message: ' . ($result['description'] ?? 'unknown error'));
        }

        return [
            'success' => true,
            'reference' => $result['message_id'],
        ];
    }
}
