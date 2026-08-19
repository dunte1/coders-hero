<?php

namespace App\Services\Notifications\Channels;

use App\Mail\NotificationMail;
use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\Notifications\Contracts\NotificationChannel;
use Illuminate\Support\Facades\Mail;
use Throwable;

class EmailChannel implements NotificationChannel
{
    public function send(NotificationDelivery $delivery): array
    {
        $notification = $delivery->notification;

        if (!$notification || !$notification->notifiable instanceof User) {
            throw new \RuntimeException('Email notification has no valid recipient.');
        }

        $user = $notification->notifiable;

        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            return ['success' => true, 'reference' => null];
        }

        $data = $notification->data ?? [];
        $subject = $data['subject'] ?? $data['title'] ?? 'Notification from ' . config('app.name');
        $body = $data['body'] ?? '';
        $link = $notification->link;

        try {
            Mail::to($user->email)->send(
                new NotificationMail($subject, $body, $link)
            );

            return ['success' => true, 'reference' => null];
        } catch (Throwable $e) {
            throw new \RuntimeException('Email delivery failed: ' . $e->getMessage(), 0, $e);
        }
    }
}
