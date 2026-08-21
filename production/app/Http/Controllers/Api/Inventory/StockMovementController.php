<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreStockMovementRequest;
use App\Http\Resources\Inventory\StockMovementResource;
use App\Services\Inventory\StockService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StockService $stockService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $movements = $this->stockService->movements(
            $request->only(['type', 'inventory_item_id']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            StockMovementResource::collection($movements),
            'Stock movements retrieved successfully.'
        );
    }

    public function forItem(Request $request, int $itemId): JsonResponse
    {
        $movements = $this->stockService->movements(
            ['inventory_item_id' => $itemId, 'type' => $request->get('type')],
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            StockMovementResource::collection($movements),
            'Stock movements retrieved successfully.'
        );
    }

    public function store(StoreStockMovementRequest $request, int $itemId): JsonResponse
    {
        try {
            $movement = $this->stockService->recordMovement($itemId, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Stock item not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse(new StockMovementResource($movement), 'Stock movement recorded.');
    }
}
