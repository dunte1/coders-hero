<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Payment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudentPaymentController extends Controller
{
    use ApiResponse;

    public function index(int $feeId): JsonResponse
    {
        $fee = Fee::with('student')->find($feeId);

        if (!$fee) {
            return $this->notFoundResponse('Fee not found.');
        }

        $this->authorize('view', $fee->student);

        return $this->successResponse($fee->payments()->with('paidBy:id,name')->get(), 'Payments retrieved successfully.');
    }

    public function store(Request $request, int $feeId): JsonResponse
    {
        $fee = Fee::with('student')->find($feeId);

        if (!$fee) {
            return $this->notFoundResponse('Fee not found.');
        }

        $this->authorize('update', $fee->student);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'method' => ['nullable', 'in:cash,card,bank_transfer,online'],
            'reference' => ['nullable', 'string', 'max:120'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $payment = $fee->payments()->create([
            'receipt_no' => 'RCPT-' . strtoupper(Str::random(10)),
            'amount' => $validated['amount'],
            'method' => $validated['method'] ?? 'cash',
            'reference' => $validated['reference'] ?? null,
            'paid_at' => $validated['paid_at'] ?? now()->toDateString(),
            'paid_by_user_id' => auth()->id(),
        ]);

        $paidTotal = $fee->payments()->sum('amount');

        if ($paidTotal >= $fee->amount) {
            $fee->update(['status' => 'paid']);
        }

        return $this->createdResponse($payment->load('paidBy:id,name'), 'Payment recorded successfully.');
    }

    public function destroy(int $paymentId): JsonResponse
    {
        $payment = Payment::with('fee.student')->find($paymentId);

        if (!$payment) {
            return $this->notFoundResponse('Payment not found.');
        }

        $this->authorize('update', $payment->fee->student);

        $payment->delete();

        return $this->noContentResponse('Payment deleted successfully.');
    }
}
