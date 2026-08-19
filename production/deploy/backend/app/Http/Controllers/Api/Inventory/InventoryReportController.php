<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class InventoryReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->inventoryService->summary(), 'Inventory summary retrieved successfully.');
    }
}
