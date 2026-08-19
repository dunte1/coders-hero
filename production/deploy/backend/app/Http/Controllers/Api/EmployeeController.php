<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Employee\StoreEmployeeRequest;
use App\Http\Requests\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeDetailResource;
use App\Http\Resources\EmployeeResource;
use App\Services\EmployeeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EmployeeService $employeeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $employees = $search
            ? $this->employeeService->search($search, $perPage)
            : $this->employeeService->getAll($perPage);

        return $this->paginatedResponse($employees, 'Employees retrieved successfully.');
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->employeeService->create($request->validated());

        return $this->createdResponse(
            new EmployeeDetailResource($employee),
            'Employee created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeService->getById($id);

        if (!$employee) {
            return $this->notFoundResponse('Employee not found.');
        }

        return $this->successResponse(
            new EmployeeDetailResource($employee),
            'Employee retrieved successfully.'
        );
    }

    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = $this->employeeService->update($id, $request->validated());

        return $this->successResponse(
            new EmployeeDetailResource($employee->fresh(['user', 'department', 'position'])),
            'Employee updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->employeeService->delete($id);

        return $this->noContentResponse('Employee deleted successfully.');
    }

    public function directory(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $employees = $this->employeeService->getDirectory($perPage);

        return $this->paginatedResponse($employees, 'Directory retrieved successfully.');
    }

    public function onboard(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->employeeService->onboard($request->validated());

        return $this->createdResponse(
            new EmployeeDetailResource($employee),
            'Employee onboarded successfully.'
        );
    }

    public function offboard(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|in:resigned,terminated',
        ]);

        $employee = $this->employeeService->offboard($id, $request->get('reason', 'resigned'));

        return $this->successResponse(
            new EmployeeDetailResource($employee),
            'Employee offboarded successfully.'
        );
    }

    public function byDepartment(Request $request, int $departmentId): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $employees = $this->employeeService->getByDepartment($departmentId, $perPage);

        return $this->paginatedResponse($employees, 'Employees retrieved successfully.');
    }
}
