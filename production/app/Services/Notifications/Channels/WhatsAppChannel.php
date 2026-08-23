<?php

namespace App\Services\Notifications\Channels;

use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\Notifications\Contracts\NotificationChannel;
use App\Services\Notifications\WhatsAppGateway;
use RuntimeException;

class WhatsAppChannel implements NotificationChannel
{
    public function __construct(private WhatsAppGateway $gateway) {}

    public function send(NotificationDelivery $delivery): array
    {
        $notification = $delivery->notification;

        if (!$notification || !$notification->notifiable instanceof User) {
            throw new RuntimeException('WhatsApp notification has no valid recipient.');
        }

        $user = $notification->notifiable;
        $phone = $user->phone;

        if (!is_string($phone) || trim($phone) === '') {
            return ['success' => true, 'reference' => null];
        }

        $data = $notification->data ?? [];
        $message = $data['body'] ?? $data['title'] ?? '';

        $result = $this->gateway->send($phone, $message);

        if (!$result) {
            throw new RuntimeException('WhatsApp delivery failed.');
        }

        return [
            'success' => true,
            'reference' => null,
        ];
    }
}
