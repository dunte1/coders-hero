<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContractRequest;
use App\Http\Requests\UpdateContractRequest;
use App\Models\SchoolContract;
use App\Services\Organization\ContractService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ContractService $contractService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $contracts = $this->contractService->index(
            $request->only(['status', 'partner_school_id', 'search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($contracts, 'Contracts retrieved successfully.');
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        try {
            $contract = $this->contractService->store($request->validated());

            return $this->createdResponse($contract->load(['partnerSchool']), 'Contract created successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create contract: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $contract = $this->contractService->show($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Contract not found.');
        }

        return $this->successResponse($contract, 'Contract retrieved successfully.');
    }

    public function update(UpdateContractRequest $request, int $id): JsonResponse
    {
        try {
            $contract = $this->contractService->update($id, $request->validated());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Contract not found.');
        }

        return $this->successResponse($contract, 'Contract updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->contractService->destroy($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Contract not found.');
        }

        return $this->noContentResponse('Contract deleted successfully.');
    }

    public function uploadDocument(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'document' => ['required', 'file', 'max:10240', 'mimes:pdf,doc,docx'],
        ]);

        try {
            $contract = $this->contractService->uploadDocument($id, $request->file('document'));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Contract not found.');
        }

        return $this->successResponse($contract, 'Document uploaded successfully.');
    }
}
