<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreLocationRequest;
use App\Http\Requests\Inventory\UpdateLocationRequest;
use App\Http\Resources\Inventory\LocationResource;
use App\Services\Inventory\InventoryService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $locations = $this->inventoryService->locations(
            $request->only(['search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LocationResource::collection($locations),
            'Locations retrieved successfully.'
        );
    }

    public function options(): JsonResponse
    {
        return $this->successResponse(
            LocationResource::collection($this->inventoryService->allLocations()),
            'Locations retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $location = $this->inventoryService->showLocation($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Location not found.');
        }

        return $this->successResponse(new LocationResource($location));
    }

    public function store(StoreLocationRequest $request): JsonResponse
    {
        $location = $this->inventoryService->storeLocation($request->validated());

        return $this->createdResponse(new LocationResource($location), 'Location created.');
    }

    public function update(UpdateLocationRequest $request, int $id): JsonResponse
    {
        try {
            $location = $this->inventoryService->updateLocation($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Location not found.');
        }

        return $this->successResponse(new LocationResource($location), 'Location updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->inventoryService->destroyLocation($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Location not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->noContentResponse('Location deleted.');
    }
}
