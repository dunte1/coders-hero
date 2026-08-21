<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreAssetCategoryRequest;
use App\Http\Requests\Inventory\UpdateAssetCategoryRequest;
use App\Http\Resources\Inventory\AssetCategoryResource;
use App\Services\Inventory\InventoryService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetCategoryController extends Controller
{
    use ApiResponse;

    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $this->inventoryService->categories(
            $request->only(['search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            AssetCategoryResource::collection($categories),
            'Categories retrieved successfully.'
        );
    }

    public function options(): JsonResponse
    {
        return $this->successResponse(
            AssetCategoryResource::collection($this->inventoryService->allCategories()),
            'Categories retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $category = $this->inventoryService->showCategory($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Category not found.');
        }

        return $this->successResponse(new AssetCategoryResource($category));
    }

    public function store(StoreAssetCategoryRequest $request): JsonResponse
    {
        $category = $this->inventoryService->storeCategory($request->validated());

        return $this->createdResponse(new AssetCategoryResource($category), 'Category created.');
    }

    public function update(UpdateAssetCategoryRequest $request, int $id): JsonResponse
    {
        try {
            $category = $this->inventoryService->updateCategory($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Category not found.');
        }

        return $this->successResponse(new AssetCategoryResource($category), 'Category updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->inventoryService->destroyCategory($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Category not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->noContentResponse('Category deleted.');
    }
}
