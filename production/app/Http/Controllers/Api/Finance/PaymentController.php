<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Finance\PaymentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()
            ->with(['invoice.student', 'fee.student', 'paidBy:id,name'])
            ->when($request->get('invoice_id'), fn ($q, $v) => $q->where('invoice_id', $v))
            ->when(($request->get('method')) && ($request->get('method') !== 'all'), fn ($q, $v) => $q->where('method', $v))
            ->when(($request->get('from')) && ($request->get('from') !== 'all'), fn ($q, $v) => $q->whereDate('paid_at', '>=', $v))
            ->when(($request->get('to')) && ($request->get('to') !== 'all'), fn ($q, $v) => $q->whereDate('paid_at', '<=', $v))
            ->when($request->get('search'), function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('receipt_no', 'like', "%{$v}%")
                        ->orWhere('reference', 'like', "%{$v}%")
                        ->orWhereHas('invoice.student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%"))
                        ->orWhereHas('fee.student', fn ($s) => $s->where('first_name', 'like', "%{$v}%")->orWhere('last_name', 'like', "%{$v}%"));
                });
            })
            ->orderByDesc('paid_at')
            ->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($query, 'Payments retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $payment = Payment::with(['invoice.student', 'fee.student', 'paidBy:id,name', 'mpesaTransaction'])->find($id);

        if (!$payment) {
            return $this->notFoundResponse('Payment not found.');
        }

        return $this->successResponse($payment, 'Receipt retrieved successfully.');
    }

    public function pdf(int $id): StreamedResponse
    {
        $payment = Payment::with(['invoice.student', 'fee.student', 'paidBy:id,name', 'mpesaTransaction'])->find($id);

        if (!$payment) {
            abort(404, 'Payment not found.');
        }

        return $this->paymentService->receiptPdf($payment);
    }

    public function reverse(int $id): JsonResponse
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return $this->notFoundResponse('Payment not found.');
        }

        $this->paymentService->reverse($payment);

        return $this->successResponse(null, 'Payment reversed.');
    }
}
