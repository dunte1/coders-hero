<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

class FcmGateway
{
    public function isConfigured(): bool
    {
        return (bool) config('notifications.fcm.enabled') &&
            filled(config('notifications.fcm.project_id')) &&
            ($this->accessToken() !== null);
    }

    /**
     * The bearer token used against the FCM HTTP v1 API.
     * Prefers a legacy server key; falls back to a Google OAuth2 service-account flow.
     */
    public function accessToken(): ?string
    {
        $serverKey = config('notifications.fcm.server_key');
        if (filled($serverKey)) {
            return $serverKey;
        }

        $cacheKey = 'fcm_access_token';

        return Cache::remember($cacheKey, 3500, function () {
            return $this->generateAccessToken();
        });
    }

    private function generateAccessToken(): ?string
    {
        $credentialsFile = config('notifications.fcm.credentials_file');
        if (!is_string($credentialsFile) || !is_file($credentialsFile)) {
            return null;
        }

        try {
            $credentials = json_decode((string) file_get_contents($credentialsFile), true);

            $now = time();
            $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
            $claims = $this->base64UrlEncode(json_encode([
                'iss' => $credentials['client_email'] ?? '',
                'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
                'aud' => $credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

            $signature = '';
            openssl_sign(
                $header . '.' . $claims,
                $signature,
                $credentials['private_key'] ?? '',
                OPENSSL_ALGO_SHA256
            );

            $jwt = $header . '.' . $claims . '.' . $this->base64UrlEncode($signature);

            $response = Http::asForm()
                ->timeout(20)
                ->post($credentials['token_uri'] ?? 'https://oauth2.googleapis.com/token', [
                    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    'assertion' => $jwt,
                ]);

            return $response->json('access_token');
        } catch (Throwable $e) {
            return null;
        }
    }

    /**
     * Send a push message to a single FCM token.
     */
    public function send(string $token, string $title, string $body, array $data = []): array
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('Firebase Cloud Messaging is not configured.');
        }

        $projectId = config('notifications.fcm.project_id');
        $endpoint = sprintf(config('notifications.fcm.endpoint'), $projectId);

        try {
            $response = Http::withToken((string) $this->accessToken())
                ->acceptJson()
                ->timeout(20)
                ->post($endpoint, [
                    'message' => [
                        'token' => $token,
                        'notification' => [
                            'title' => $title,
                            'body' => $body,
                        ],
                        'data' => $data,
                    ],
                ]);
        } catch (Throwable $e) {
            throw new RuntimeException('FCM request failed: ' . $e->getMessage(), 0, $e);
        }

        $messageId = $response->json('name');

        if ($response->failed() || $messageId === null) {
            throw new RuntimeException('FCM rejected the message: ' . $response->body());
        }

        return ['message_id' => $messageId];
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
