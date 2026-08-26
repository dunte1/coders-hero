<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\MpesaStkPushRequest;
use App\Models\Fee;
use App\Models\Invoice;
use App\Models\MpesaTransaction;
use App\Services\Finance\MpesaCallbackService;
use App\Services\Finance\MpesaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MpesaController extends Controller
{
    use ApiResponse;

    public function __construct(
        private MpesaService $mpesaService,
        private MpesaCallbackService $callbackService
    ) {}

    /**
     * Initiate an STK push. The payment status is never trusted from the client;
     * the callback is the single source of truth.
     */
    public function stkPush(MpesaStkPushRequest $request): JsonResponse
    {
        $invoice = $request->input('invoice_id') ? Invoice::find($request->input('invoice_id')) : null;
        $fee = $request->input('fee_id') ? Fee::find($request->input('fee_id')) : null;

        $payable = $invoice ?: $fee;

        if (!$payable) {
            return $this->notFoundResponse('Payable not found.');
        }

        if (!$this->canAccessPayable($payable)) {
            return $this->forbiddenResponse('You do not have access to this payable.');
        }

        if (method_exists($payable, 'isPaid') && $payable->isPaid()) {
            return $this->errorResponse('This invoice has already been paid.', 422);
        }

        $phone = $this->normalizePhone($request->input('phone'));

        $amount = $invoice
            ? $invoice->balance
            : max(0, (float) $fee->amount - (float) $fee->payments()->sum('amount'));

        if ($amount <= 0) {
            return $this->errorResponse('There is nothing outstanding to pay.', 422);
        }

        // Idempotency: reuse an in-flight pending transaction for the same payable + user.
        $existing = MpesaTransaction::query()
            ->where('status', 'pending')
            ->when($invoice, fn ($q) => $q->where('invoice_id', $invoice->id))
            ->when($fee, fn ($q) => $q->where('fee_id', $fee->id))
            ->where('user_id', auth()->id())
            ->latest()
            ->first();

        if ($existing) {
            return $this->successResponse($existing, 'An M-Pesa request is already in progress.');
        }

        $transaction = MpesaTransaction::create([
            'merchant_request_id' => 'PENDING',
            'checkout_request_id' => 'PENDING-' . strtoupper(uniqid()),
            'amount' => $amount,
            'phone_number' => $phone,
            'fee_id' => $fee?->id,
            'invoice_id' => $invoice?->id,
            'user_id' => auth()->id(),
            'status' => 'pending',
        ]);

        try {
            $response = $this->mpesaService->stkPush(
                $phone,
                $amount,
                $invoice ? 'INV-' . $invoice->invoice_no : 'FEE-' . $fee->id,
                $invoice ? ($invoice->description ?? 'Invoice payment') : ($fee->label ?? 'Fee payment')
            );
        } catch (\RuntimeException $e) {
            $transaction->update([
                'status' => 'failed',
                'result_desc' => $e->getMessage(),
            ]);

            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 502);
        }

        $transaction->update([
            'merchant_request_id' => $response['MerchantRequestID'] ?? 'PENDING',
            'checkout_request_id' => $response['CheckoutRequestID'] ?? $transaction->checkout_request_id,
            'result_code' => (int) ($response['ResponseCode'] ?? 0),
            'result_desc' => $response['ResponseDescription'] ?? null,
        ]);

        return $this->successResponse(
            $transaction,
            'STK push sent. Confirm the prompt on your phone.'
        );
    }

    /**
     * Public Daraja callback endpoint. No auth; payload integrity is enforced by
     * matching the CheckoutRequestID to a stored transaction.
     */
    public function callback(Request $request): JsonResponse
    {
        $allowedIps = config('mpesa.allowed_callback_ips', []);

        if (!empty($allowedIps)) {
            $clientIp = $request->ip();
            if (!in_array($clientIp, $allowedIps)) {
                \Log::warning('M-Pesa callback from unauthorized IP', ['ip' => $clientIp]);
                return $this->errorResponse('Unauthorized.', 403);
            }
        }

        try {
            $transaction = $this->callbackService->handle($request->all());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse($transaction->fresh(['payment', 'invoice', 'fee']), 'Callback processed.');
    }

    public function status(int $id): JsonResponse
    {
        $transaction = MpesaTransaction::with(['invoice', 'fee', 'payment'])->find($id);

        if (!$transaction) {
            return $this->notFoundResponse('Transaction not found.');
        }

        if ($transaction->user_id !== auth()->id() && !auth()->user()->hasAnyRole(['admin', 'super_admin'])) {
            return $this->forbiddenResponse('You do not have access to this transaction.');
        }

        return $this->successResponse($transaction, 'Transaction status retrieved successfully.');
    }

    public function transactions(Request $request): JsonResponse
    {
        $transactions = MpesaTransaction::query()
            ->with(['invoice.student', 'fee.student'])
            ->when(($request->get('status')) && ($request->get('status') !== 'all'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->get('search'), function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('mpesa_receipt_number', 'like', "%{$v}%")
                        ->orWhere('phone_number', 'like', "%{$v}%")
                        ->orWhere('checkout_request_id', 'like', "%{$v}%")
                        ->orWhereHas('invoice.student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%"))
                        ->orWhereHas('fee.student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%"));
                });
            })
            ->orderByDesc('created_at')
            ->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($transactions, 'M-Pesa transactions retrieved successfully.');
    }

    private function canAccessPayable(Invoice|Fee $payable): bool
    {
        $user = auth()->user();

        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            return true;
        }

        $studentId = $payable->student_id;

        $student = \App\Models\Student::where('user_id', $user->id)->first();

        if ($student && $student->id === $studentId) {
            return true;
        }

        return $user->guardian?->students()->where('students.id', $studentId)->exists() ?? false;
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/\D+/', '', $phone);

        if (str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }

        return $phone;
    }
}
