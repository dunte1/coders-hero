<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\StoreContractRequest;
use App\Http\Requests\Hr\UpdateContractRequest;
use App\Http\Resources\Hr\EmployeeContractResource;
use App\Models\EmployeeContract;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $contracts = EmployeeContract::query()
            ->with(['employee.user', 'employee.department'])
            ->when($request->get('employee_id'), fn ($q, $id) => $q->where('employee_id', (int) $id))
            ->when($request->get('status'), fn ($q, $s) => $q->byStatus($s))
            ->when($request->get('type'), fn ($q, $t) => $q->byType($t))
            ->orderByDesc('start_date');

        return $this->paginatedResponse(
            $contracts->paginate((int) $request->get('per_page', 15)),
            'Contracts retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $contract = EmployeeContract::with(['employee.user', 'employee.department', 'createdBy'])
            ->find($id);

        if (!$contract) {
            return $this->notFoundResponse('Contract not found.');
        }

        return $this->successResponse(
            new EmployeeContractResource($contract),
            'Contract retrieved successfully.'
        );
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['created_by_user_id'] = auth()->id();

        $contract = EmployeeContract::create($data);

        return $this->createdResponse(
            new EmployeeContractResource($contract->load(['employee.user', 'createdBy'])),
            'Contract created successfully.'
        );
    }

    public function update(UpdateContractRequest $request, int $id): JsonResponse
    {
        $contract = EmployeeContract::find($id);

        if (!$contract) {
            return $this->notFoundResponse('Contract not found.');
        }

        $contract->update($request->validated());

        return $this->successResponse(
            new EmployeeContractResource($contract->load(['employee.user'])),
            'Contract updated successfully.'
        );
    }

    public function terminate(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|string|in:terminated,superseded']);

        $contract = EmployeeContract::find($id);

        if (!$contract) {
            return $this->notFoundResponse('Contract not found.');
        }

        $contract->update(['status' => $request->get('status')]);

        return $this->successResponse(
            new EmployeeContractResource($contract->load(['employee.user'])),
            'Contract terminated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $contract = EmployeeContract::find($id);

        if (!$contract) {
            return $this->notFoundResponse('Contract not found.');
        }

        $contract->delete();

        return $this->noContentResponse('Contract deleted successfully.');
    }
}
