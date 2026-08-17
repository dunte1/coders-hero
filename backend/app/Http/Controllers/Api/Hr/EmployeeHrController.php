<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\UpdateEmployeeHrRequest;
use App\Http\Resources\Hr\EmployeeHrResource;
use App\Services\EmployeeService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmployeeHrController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EmployeeService $employeeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 15);
        $search = $request->get('search');

        $employees = $search
            ? $this->employeeService->search($search, $perPage)
            : $this->employeeService->getAll($perPage);

        $employees->getCollection()->loadMissing([
            'user', 'department', 'position', 'contracts',
            'leaveRequests', 'payslips', 'documents',
        ]);

        $paginated = new \Illuminate\Pagination\LengthAwarePaginator(
            EmployeeHrResource::collection($employees->getCollection())->resolve(),
            $employees->total(),
            $employees->perPage(),
            $employees->currentPage(),
            ['path' => $employees->path(), 'query' => request()->query()]
        );

        return $this->paginatedResponse($paginated, 'Employees retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $employee = $this->employeeService->getById($id);

        if (!$employee) {
            return $this->notFoundResponse('Employee not found.');
        }

        $employee->loadMissing(['user', 'department', 'position', 'contracts', 'documents']);

        return $this->successResponse(
            new EmployeeHrResource($employee),
            'Employee retrieved successfully.'
        );
    }

    public function update(UpdateEmployeeHrRequest $request, int $id): JsonResponse
    {
        $employee = $this->employeeService->update($id, $request->validated());

        $employee->loadMissing(['user', 'department', 'position', 'contracts']);

        return $this->successResponse(
            new EmployeeHrResource($employee),
            'Employee updated successfully.'
        );
    }
}
