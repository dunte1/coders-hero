<?php

namespace App\Http\Controllers\Api\Crm;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\Lead;
use App\Services\Crm\LeadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LeadService $leadService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $leads = $this->leadService->index(
            $request->only(['status', 'search', 'owner_id']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($leads, 'Leads retrieved successfully.');
    }

    public function store(StoreLeadRequest $request): JsonResponse
    {
        try {
            $lead = $this->leadService->store($request->validated());

            return $this->createdResponse($lead->load(['owner:id,name']), 'Lead created successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create lead: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $lead = $this->leadService->show($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Lead not found.');
        }

        return $this->successResponse($lead, 'Lead retrieved successfully.');
    }

    public function update(UpdateLeadRequest $request, int $id): JsonResponse
    {
        try {
            $lead = $this->leadService->update($id, $request->validated());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Lead not found.');
        }

        return $this->successResponse($lead, 'Lead updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->leadService->destroy($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Lead not found.');
        }

        return $this->noContentResponse('Lead deleted successfully.');
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:new,contacted,qualified,won,lost'],
        ]);

        try {
            $lead = $this->leadService->changeStatus($id, $validated['status']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException) {
            return $this->notFoundResponse('Lead not found.');
        }

        return $this->successResponse($lead, 'Lead status updated successfully.');
    }
}
