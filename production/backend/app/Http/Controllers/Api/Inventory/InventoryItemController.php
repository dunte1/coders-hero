<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreInventoryItemRequest;
use App\Http\Requests\Inventory\UpdateInventoryItemRequest;
use App\Http\Resources\Inventory\InventoryItemResource;
use App\Services\Inventory\StockService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryItemController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StockService $stockService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->stockService->index(
            $request->only(['search', 'category_id', 'low_stock']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            InventoryItemResource::collection($items),
            'Stock items retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $item = $this->stockService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Stock item not found.');
        }

        return $this->successResponse(new InventoryItemResource($item));
    }

    public function store(StoreInventoryItemRequest $request): JsonResponse
    {
        $item = $this->stockService->store($request->validated());

        return $this->createdResponse(new InventoryItemResource($item->load(['category', 'location'])), 'Stock item created.');
    }

    public function update(UpdateInventoryItemRequest $request, int $id): JsonResponse
    {
        try {
            $item = $this->stockService->update($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Stock item not found.');
        }

        return $this->successResponse(new InventoryItemResource($item), 'Stock item updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->stockService->destroy($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Stock item not found.');
        }

        return $this->noContentResponse('Stock item deleted.');
    }

    public function lowStock(): JsonResponse
    {
        return $this->successResponse(
            InventoryItemResource::collection($this->stockService->lowStockItems()),
            'Low stock items retrieved successfully.'
        );
    }
}
