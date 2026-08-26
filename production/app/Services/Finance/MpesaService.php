<?php

namespace App\Services\Finance;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class MpesaService
{
    public function isSandbox(): bool
    {
        return config('mpesa.env') !== 'live';
    }

    public function baseUrl(): string
    {
        return rtrim((string) config('mpesa.base_url'), '/');
    }

    /**
     * Obtain and cache a Daraja OAuth access token.
     */
    public function accessToken(): string
    {
        return Cache::remember('mpesa_access_token', now()->addMinutes(50), function () {
            $response = Http::withBasicAuth(config('mpesa.consumer_key'), config('mpesa.consumer_secret'))
                ->acceptJson()
                ->get($this->baseUrl() . '/oauth/v1/generate?grant_type=client_credentials');

            if (!$response->successful()) {
                throw new \RuntimeException('M-Pesa authentication failed.', 502);
            }

            $token = $response->json('access_token');

            if (!$token) {
                throw new \RuntimeException('M-Pesa authentication failed.', 502);
            }

            return $token;
        });
    }

    /**
     * Initiate an STK Push. Returns the raw Daraja response (with CheckoutRequestID).
     *
     * @return array<string, mixed>
     */
    public function stkPush(string $phone, float $amount, string $accountReference, string $description = ''): array
    {
        $shortcode = config('mpesa.shortcode');
        $passkey = config('mpesa.passkey');

        if (!$shortcode || !$passkey) {
            throw new \RuntimeException('M-Pesa is not configured.', 500);
        }

        $timestamp = now()->format('YmdHis');
        $password = base64_encode($shortcode . $passkey . $timestamp);

        $payload = [
            'BusinessShortCode' => $shortcode,
            'Password' => $password,
            'Timestamp' => $timestamp,
            'TransactionType' => 'CustomerPayBillOnline',
            'Amount' => (int) round($amount, 0),
            'PartyA' => $phone,
            'PartyB' => $shortcode,
            'PhoneNumber' => $phone,
            'CallBackURL' => config('mpesa.callback_url'),
            'AccountReference' => $accountReference,
            'TransactionDesc' => $description ?: 'Payment',
        ];

        $response = Http::withToken($this->accessToken())
            ->acceptJson()
            ->post($this->baseUrl() . '/mpesa/stkpush/v1/processrequest', $payload);

        $data = $response->json() ?? [];

        if (($data['ResponseCode'] ?? '1') !== '0') {
            throw new \RuntimeException(
                $data['ResponseDescription'] ?? 'M-Pesa request failed.',
                502
            );
        }

        return $data;
    }
}
