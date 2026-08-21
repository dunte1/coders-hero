<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationPreferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'category' => $this['category'],
            'email' => (bool) $this['email'],
            'sms' => (bool) $this['sms'],
            'push' => (bool) $this['push'],
            'in_app' => (bool) $this['in_app'],
        ];
    }
}
