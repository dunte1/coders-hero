<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use App\Services\Inventory\ProcurementService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ProcurementService $procurementService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $suppliers = $this->procurementService->indexSuppliers(
            $request->only(['search', 'status']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($suppliers, 'Suppliers retrieved successfully.');
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        try {
            $supplier = $this->procurementService->storeSupplier($request->validated());

            return $this->createdResponse($supplier, 'Supplier created successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create supplier: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $supplier = $this->procurementService->showSupplier($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Supplier not found.');
        }

        return $this->successResponse($supplier, 'Supplier retrieved successfully.');
    }

    public function update(UpdateSupplierRequest $request, int $id): JsonResponse
    {
        try {
            $supplier = $this->procurementService->updateSupplier($id, $request->validated());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Supplier not found.');
        }

        return $this->successResponse($supplier, 'Supplier updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->procurementService->destroySupplier($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Supplier not found.');
        }

        return $this->noContentResponse('Supplier deleted successfully.');
    }
}
