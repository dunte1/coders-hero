<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'category_label' => config('notifications.categories.' . $this->category, $this->category),
            'subject' => $this->subject,
            'body' => $this->body,
            'channels' => $this->defaultChannels(),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
