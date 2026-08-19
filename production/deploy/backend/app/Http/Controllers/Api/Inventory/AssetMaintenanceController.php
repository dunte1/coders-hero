<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreMaintenanceRecordRequest;
use App\Http\Requests\Inventory\UpdateMaintenanceRecordRequest;
use App\Http\Resources\Inventory\AssetMaintenanceRecordResource;
use App\Services\Inventory\AssetService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetMaintenanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AssetService $assetService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $records = $this->assetService->maintenanceRecords(
            $request->only(['status', 'asset_id']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            AssetMaintenanceRecordResource::collection($records),
            'Maintenance records retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $record = $this->assetService->showMaintenanceRecord($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Maintenance record not found.');
        }

        return $this->successResponse(new AssetMaintenanceRecordResource($record));
    }

    public function store(StoreMaintenanceRecordRequest $request): JsonResponse
    {
        try {
            $record = $this->assetService->storeMaintenanceRecord($request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Asset not found.');
        }

        return $this->createdResponse(new AssetMaintenanceRecordResource($record), 'Maintenance record created.');
    }

    public function update(UpdateMaintenanceRecordRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->assetService->updateMaintenanceRecord($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Maintenance record not found.');
        }

        return $this->successResponse(new AssetMaintenanceRecordResource($record), 'Maintenance record updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assetService->destroyMaintenanceRecord($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Maintenance record not found.');
        }

        return $this->noContentResponse('Maintenance record deleted.');
    }
}
