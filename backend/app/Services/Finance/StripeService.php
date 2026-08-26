<?php

namespace App\Services\Finance;

use App\Models\Invoice;
use App\Models\StripeTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class StripeService
{
    public function isConfigured(): bool
    {
        return !empty(config('stripe.secret_key'));
    }

    /**
     * Create a Stripe Checkout Session for an invoice.
     *
     * @return array{url: string, session_id: string}
     */
    public function createCheckoutSession(Invoice $invoice, string $successUrl, string $cancelUrl): array
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('Stripe is not configured.', 500);
        }

        $lineItems = $invoice->items->map(function ($item) {
            return [
                'price_data' => [
                    'currency' => config('stripe.currency', 'usd'),
                    'product_data' => [
                        'name' => $item->description ?? 'Invoice Item',
                    ],
                    'unit_amount' => (int) round($item->amount * 100),
                ],
                'quantity' => $item->quantity ?? 1,
            ];
        })->toArray();

        if (empty($lineItems)) {
            $lineItems = [[
                'price_data' => [
                    'currency' => config('stripe.currency', 'usd'),
                    'product_data' => [
                        'name' => $invoice->description ?? 'Invoice ' . $invoice->invoice_no,
                    ],
                    'unit_amount' => (int) round($invoice->amount * 100),
                ],
                'quantity' => 1,
            ]];
        }

        $metadata = [
            'invoice_id' => $invoice->id,
            'invoice_no' => $invoice->invoice_no,
            'student_id' => $invoice->student_id,
        ];

        $session = $this->callStripe('POST', '/v1/checkout/sessions', [
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => $successUrl . '&session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancelUrl,
            'metadata' => $metadata,
            'client_reference_id' => $invoice->invoice_no,
        ]);

        return [
            'url' => $session['url'],
            'session_id' => $session['id'],
        ];
    }

    /**
     * Retrieve a Checkout Session by ID.
     */
    public function getCheckoutSession(string $sessionId): array
    {
        return $this->callStripe('GET', '/v1/checkout/sessions/' . $sessionId);
    }

    /**
     * Handle a Stripe webhook event.
     */
    public function handleWebhook(array $payload, string $sigHeader): void
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('Stripe is not configured.', 500);
        }

        $webhookSecret = config('stripe.webhook_secret');
        if (!$webhookSecret) {
            throw new \RuntimeException('Stripe webhook secret is not configured.', 500);
        }
        $this->verifyWebhookSignature($payload, $sigHeader, $webhookSecret);

        $type = $payload['type'] ?? '';
        $data = $payload['data']['object'] ?? [];

        if ($type === 'checkout.session.completed') {
            $this->handleCheckoutCompleted($data);
        }
    }

    private function handleCheckoutCompleted(array $session): void
    {
        $invoiceId = $session['metadata']['invoice_id'] ?? null;
        if (!$invoiceId) {
            return;
        }

        $invoice = Invoice::lockForUpdate()->find($invoiceId);
        if (!$invoice) {
            return;
        }

        $existing = StripeTransaction::where('stripe_session_id', $session['id'])->first();
        if ($existing && $existing->status === 'completed') {
            return;
        }

        $transaction = $existing ?: StripeTransaction::create([
            'stripe_session_id' => $session['id'],
            'stripe_payment_intent' => $session['payment_intent'] ?? null,
            'amount' => ($session['amount_total'] ?? 0) / 100,
            'currency' => strtoupper($session['currency'] ?? 'usd'),
            'invoice_id' => $invoiceId,
            'user_id' => $invoice->created_by_user_id,
            'status' => 'completed',
            'paid_at' => now(),
            'raw_payload' => $session,
        ]);

        if ($existing) {
            $existing->update([
                'status' => 'completed',
                'stripe_payment_intent' => $session['payment_intent'] ?? $existing->stripe_payment_intent,
                'paid_at' => now(),
                'raw_payload' => $session,
            ]);
        }

        $paymentRef = $session['payment_intent'] ?? $session['id'];
        $alreadyPaid = \App\Models\Payment::where('invoice_id', $invoiceId)
            ->where('reference', $paymentRef)
            ->exists();

        if ($alreadyPaid) {
            return;
        }

        $payment = \App\Models\Payment::create([
            'invoice_id' => $invoiceId,
            'receipt_no' => 'STRIPE-' . strtoupper(Str::random(10)),
            'amount' => $transaction->amount,
            'method' => 'card',
            'reference' => $paymentRef,
            'paid_at' => now()->toDateString(),
            'paid_by_user_id' => $transaction->user_id,
        ]);

        $transaction->update(['payment_id' => $payment->id]);

        $invoice->recalculateFromPayments();
    }

    private function verifyWebhookSignature(array $payload, string $sigHeader, string $secret): void
    {
        $elements = explode(',', $sigHeader);
        $timestamp = null;
        $signature = null;

        foreach ($elements as $element) {
            $parts = explode('=', $element, 2);
            if (count($parts) === 2) {
                $parts[0] = trim($parts[0]);
                $parts[1] = trim($parts[1]);
                if ($parts[0] === 't') {
                    $timestamp = $parts[1];
                } elseif ($parts[0] === 'v1') {
                    $signature = $parts[1];
                }
            }
        }

        if (!$timestamp || !$signature) {
            throw new \RuntimeException('Invalid Stripe webhook signature format.', 400);
        }

        $signedPayload = $timestamp . '.' . json_encode($payload, JSON_UNESCAPED_SLASHES);
        $expectedSignature = hash_hmac('sha256', $signedPayload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            throw new \RuntimeException('Invalid Stripe webhook signature.', 400);
        }
    }

    private function callStripe(string $method, string $uri, array $data = []): array
    {
        $secretKey = config('stripe.secret_key');
        if (!$secretKey) {
            throw new \RuntimeException('Stripe secret key is not configured.', 500);
        }

        $url = 'https://api.stripe.com' . $uri;

        if (strtoupper($method) === 'GET') {
            $response = Http::withToken($secretKey)
                ->acceptJson()
                ->get($url);
        } else {
            $response = Http::withToken($secretKey)
                ->acceptJson()
                ->asForm()
                ->post($url, $this->flattenForStripe($data));
        }

        if ($response->failed()) {
            $error = $response->json('error.message') ?? 'Stripe API request failed.';
            throw new \RuntimeException($error, $response->status());
        }

        return $response->json();
    }

    /**
     * Flatten nested arrays for Stripe's form-encoded API.
     */
    private function flattenForStripe(array $data, string $prefix = ''): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $newKey = $prefix ? "{$prefix}[{$key}]" : $key;

            if (is_array($value)) {
                $result = array_merge($result, $this->flattenForStripe($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }
}
