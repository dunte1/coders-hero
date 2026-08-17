<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Resources\Hr\EmployeeHrResource;
use App\Services\Hr\HrService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class MyHrController extends Controller
{
    use ApiResponse;

    public function __construct(
        private HrService $hrService
    ) {}

    public function summary(): JsonResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their HR dashboard.');
        }

        return $this->successResponse(
            $this->hrService->mySummary($employee),
            'HR summary retrieved successfully.'
        );
    }

    public function profile(): JsonResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their HR profile.');
        }

        $employee->loadMissing(['user', 'department', 'position', 'contracts', 'documents']);

        return $this->successResponse(
            new EmployeeHrResource($employee),
            'HR profile retrieved successfully.'
        );
    }
}
