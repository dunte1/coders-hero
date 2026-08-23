<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Http;

class WhatsAppGateway
{
    public function send(string $to, string $message): bool
    {
        $token = config('services.whatsapp.token');
        $phoneId = config('services.whatsapp.phone_number_id');

        if (!$token || !$phoneId) {
            return false;
        }

        $response = Http::withToken($token)
            ->post("https://graph.facebook.com/v18.0/{$phoneId}/messages", [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'type' => 'text',
                'text' => ['body' => $message],
            ]);

        return $response->successful();
    }
}
