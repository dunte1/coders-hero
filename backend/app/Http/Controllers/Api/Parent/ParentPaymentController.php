<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Payment;
use App\Services\Finance\PaymentService;
use App\Services\Parents\ParentPortalService;
use App\Services\Pdf\DocumentPdfService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ParentPaymentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService,
        private PaymentService $paymentService,
        private DocumentPdfService $pdf
    ) {}

    public function store(Request $request, int $feeId): JsonResponse
    {
        $fee = Fee::with('student')->find($feeId);

        if (!$fee) {
            return $this->notFoundResponse('Fee not found.');
        }

        if (!$this->portalService->hasAccessToStudent($fee->student_id)) {
            return $this->forbiddenResponse('You do not have access to this fee.');
        }

        if ($fee->isPaid()) {
            return $this->errorResponse('This fee has already been paid.', 422);
        }

        $outstanding = $fee->outstandingBalance();

        $validated = $request->validate([
            'amount' => ['nullable', 'numeric', 'min:0.01', "max:{$outstanding}"],
            'method' => ['nullable', 'in:cash,card,bank_transfer,online'],
            'reference' => ['nullable', 'string', 'max:120'],
        ]);

        $payAmount = isset($validated['amount']) ? (float) $validated['amount'] : $outstanding;

        $payment = Payment::create([
            'fee_id' => $fee->id,
            'receipt_no' => 'RCPT-' . strtoupper(Str::random(10)),
            'amount' => $payAmount,
            'method' => $validated['method'] ?? 'online',
            'reference' => $validated['reference'] ?? 'PAY-' . strtoupper(Str::random(10)),
            'paid_at' => now()->toDateString(),
            'paid_by_user_id' => auth()->id(),
        ]);

        $newBalance = $outstanding - $payAmount;
        $fee->update(['status' => $newBalance <= 0 ? 'paid' : 'partial']);

        return $this->createdResponse($payment->load('fee.student'), 'Payment successful. Receipt generated.');
    }

    public function show(int $id): JsonResponse
    {
        $payment = Payment::with(['fee.student'])->find($id);

        if (!$payment) {
            return $this->notFoundResponse('Receipt not found.');
        }

        if (!$this->portalService->hasAccessToStudent($payment->fee->student_id)) {
            return $this->forbiddenResponse('You do not have access to this receipt.');
        }

        return $this->successResponse($payment, 'Receipt retrieved successfully.');
    }

    public function pdf(int $id): StreamedResponse
    {
        $payment = Payment::with(['fee.student'])->find($id);

        if (!$payment) {
            abort(404, 'Receipt not found.');
        }

        if (!$this->portalService->hasAccessToStudent($payment->fee->student_id)) {
            abort(403, 'You do not have access to this receipt.');
        }

        return $this->paymentService->receiptPdf($payment);
    }
}
