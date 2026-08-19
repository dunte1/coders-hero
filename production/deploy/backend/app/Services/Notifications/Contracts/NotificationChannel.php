<?php

namespace App\Services\Notifications\Contracts;

use App\Models\NotificationDelivery;

interface NotificationChannel
{
    /**
     * Deliver a notification through this channel.
     *
     * @return array{success: bool, reference?: string|null}
     *
     * @throws \Throwable when delivery fails
     */
    public function send(NotificationDelivery $delivery): array;
}
