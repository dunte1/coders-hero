<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Models\PurchaseOrder;
use App\Services\Inventory\ProcurementService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseOrderController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ProcurementService $procurementService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->procurementService->indexPurchaseOrders(
            $request->only(['status', 'search', 'supplier_id']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($orders, 'Purchase orders retrieved successfully.');
    }

    public function store(StorePurchaseOrderRequest $request): JsonResponse
    {
        try {
            $order = $this->procurementService->storePurchaseOrder($request->validated());

            return $this->createdResponse($order, 'Purchase order created successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create purchase order: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $order = $this->procurementService->showPurchaseOrder($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Purchase order not found.');
        }

        return $this->successResponse($order, 'Purchase order retrieved successfully.');
    }

    public function update(UpdatePurchaseOrderRequest $request, int $id): JsonResponse
    {
        try {
            $order = $this->procurementService->updatePurchaseOrder($id, $request->validated());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Purchase order not found.');
        }

        return $this->successResponse($order, 'Purchase order updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->procurementService->destroyPurchaseOrder($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Purchase order not found.');
        }

        return $this->noContentResponse('Purchase order deleted successfully.');
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:draft,ordered,received,cancelled'],
        ]);

        try {
            $order = $this->procurementService->changeStatus($id, $validated['status']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Purchase order not found.');
        }

        return $this->successResponse($order, 'Purchase order status updated successfully.');
    }
}
