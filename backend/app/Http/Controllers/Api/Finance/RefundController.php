<?php
namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Services\Finance\RefundService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RefundService $service
    ) {}

    public function index(): JsonResponse
    {
        $refunds = Refund::with(['payment', 'user'])->latest()->paginate(20);
        return $this->paginatedResponse($refunds, 'Refunds retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string|max:500',
        ]);

        $refund = $this->service->requestRefund($validated);
        return $this->createdResponse($refund, 'Refund request submitted');
    }

    public function approve(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate(['admin_notes' => 'nullable|string']);
        $refund = $this->service->approveRefund($id, $validated['admin_notes'] ?? null);
        return $this->successResponse($refund, 'Refund approved');
    }

    public function reject(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate(['admin_notes' => 'nullable|string']);
        $refund = $this->service->rejectRefund($id, $validated['admin_notes'] ?? null);
        return $this->successResponse($refund, 'Refund rejected');
    }
}
