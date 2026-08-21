<?php

namespace App\Services\Notifications\Channels;

use App\Models\NotificationDelivery;
use App\Services\Notifications\Contracts\NotificationChannel;

class InAppChannel implements NotificationChannel
{
    /**
     * The in-app record is created directly by the dispatcher, so this channel
     * is effectively a no-op for delivery tracking.
     */
    public function send(NotificationDelivery $delivery): array
    {
        return ['success' => true, 'reference' => null];
    }
}
