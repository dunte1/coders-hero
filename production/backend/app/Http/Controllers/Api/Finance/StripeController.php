<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\Finance\StripeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StripeService $stripeService
    ) {}

    /**
     * Create a Stripe Checkout Session for an invoice.
     */
    public function createCheckout(Request $request): JsonResponse
    {
        if (!$this->stripeService->isConfigured()) {
            return $this->errorResponse('Stripe is not configured. Please add your Stripe API keys.', 503);
        }

        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
        ]);

        $invoice = Invoice::with('items')->findOrFail($validated['invoice_id']);

        if ($invoice->isPaid()) {
            return $this->errorResponse('This invoice has already been paid.', 422);
        }

        if ($invoice->status === 'void') {
            return $this->errorResponse('This invoice has been voided.', 422);
        }

        $user = auth()->user();
        if (!$user->hasAnyRole(['admin', 'super_admin', 'accountant'])) {
            $student = \App\Models\Student::where('user_id', $user->id)->first();
            $isParent = $user->guardian?->students()->where('students.id', $invoice->student_id)->exists();

            if ((!$student || $student->id !== $invoice->student_id) && !$isParent) {
                return $this->forbiddenResponse('You do not have access to this invoice.');
            }
        }

        $successUrl = config('stripe.success_url') . '&invoice_id=' . $invoice->id;
        $cancelUrl = config('stripe.cancel_url') . '&invoice_id=' . $invoice->id;

        try {
            $result = $this->stripeService->createCheckoutSession($invoice, $successUrl, $cancelUrl);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to create checkout session: ' . $e->getMessage(), 502);
        }

        return $this->successResponse($result, 'Checkout session created.');
    }

    /**
     * Stripe webhook endpoint. Public; no auth.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $sigHeader = $request->header('Stripe-Signature', '');

        try {
            $this->stripeService->handleWebhook($payload, $sigHeader);
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }

        return $this->successResponse(null, 'Webhook processed.');
    }

    /**
     * Check the status of a Stripe Checkout Session.
     */
    public function status(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        if (!$this->stripeService->isConfigured()) {
            return $this->errorResponse('Stripe is not configured.', 503);
        }

        try {
            $session = $this->stripeService->getCheckoutSession($validated['session_id']);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to retrieve session: ' . $e->getMessage(), 502);
        }

        return $this->successResponse([
            'status' => $session['status'],
            'payment_status' => $session['payment_status'] ?? null,
            'amount_total' => ($session['amount_total'] ?? 0) / 100,
            'currency' => strtoupper($session['currency'] ?? 'usd'),
        ], 'Session status retrieved.');
    }
}
