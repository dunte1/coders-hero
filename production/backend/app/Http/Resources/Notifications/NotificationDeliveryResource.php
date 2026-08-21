<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationDeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $notification = $this->notification;

        return [
            'id' => $this->id,
            'notification_id' => $this->notification_id,
            'channel' => $this->channel,
            'status' => $this->status,
            'provider_reference' => $this->provider_reference,
            'sent_at' => $this->sent_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'failed_at' => $this->failed_at?->toISOString(),
            'error_message' => $this->error_message,
            'retry_count' => $this->retry_count,
            'last_retried_at' => $this->last_retried_at?->toISOString(),
            'metadata' => $this->metadata,
            'recipient' => $notification && $notification->notifiable ? [
                'id' => $notification->notifiable->id,
                'name' => $notification->notifiable->name ?? null,
                'email' => $notification->notifiable->email ?? null,
            ] : null,
            'subject' => $notification->data['subject'] ?? null,
            'body' => $notification->data['body'] ?? null,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
