<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->data ?? [];

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $data['title'] ?? $this->type,
            'message' => $data['body'] ?? $data['message'] ?? '',
            'subject' => $data['subject'] ?? null,
            'event' => $data['event'] ?? $this->type,
            'data' => $this->data,
            'category' => $this->category,
            'channel' => $this->channel,
            'status' => $this->status,
            'link' => $this->link,
            'metadata' => $this->metadata,
            'read_at' => $this->read_at?->toISOString(),
            'is_read' => $this->read(),
            'sent_at' => $this->sent_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'failed_at' => $this->failed_at?->toISOString(),
            'deliveries' => $this->whenLoaded('deliveries', function () {
                return $this->deliveries->map(fn ($delivery) => [
                    'channel' => $delivery->channel,
                    'status' => $delivery->status,
                    'delivered_at' => $delivery->delivered_at?->toISOString(),
                    'failed_at' => $delivery->failed_at?->toISOString(),
                    'error_message' => $delivery->error_message,
                    'retry_count' => $delivery->retry_count,
                ]);
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
