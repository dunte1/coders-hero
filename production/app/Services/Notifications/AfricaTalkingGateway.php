<?php

namespace App\Services\Notifications;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class AfricaTalkingGateway
{
    public function isConfigured(): bool
    {
        return filled(config('notifications.africastalking.api_key'));
    }

    /**
     * Send an SMS via Africa's Talking.
     *
     * @return array{message_id: string|null, status: string, status_code: int|null, description: string|null}
     */
    public function send(string $recipient, string $message): array
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Africa\'s Talking is not configured.');
        }

        try {
            $response = Http::withHeaders([
                'apiKey' => config('notifications.africastalking.api_key'),
                'Accept' => 'application/json',
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])
                ->asForm()
                ->timeout(20)
                ->post(config('notifications.africastalking.endpoint'), [
                    'username' => config('notifications.africastalking.username', 'sandbox'),
                    'to' => $recipient,
                    'from' => config('notifications.africastalking.from', 'CHHERO'),
                    'message' => $message,
                ]);
        } catch (ConnectionException $e) {
            throw new RuntimeException('SMS gateway unreachable: ' . $e->getMessage(), 0, $e);
        } catch (Throwable $e) {
            throw new RuntimeException('SMS request failed: ' . $e->getMessage(), 0, $e);
        }

        $body = $response->json();
        $recipient = $body['SMSMessageData']['Recipients'][0] ?? null;

        return [
            'message_id' => $recipient['messageId'] ?? null,
            'status' => $recipient['status'] ?? ($response->failed() ? 'error' : 'unknown'),
            'status_code' => $recipient['statusCode'] ?? null,
            'description' => $recipient['description'] ?? ($body['SMSMessageData']['Message'] ?? null),
        ];
    }
}
