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
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && !$user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Only employees can access their HR dashboard.');
        }

        if ($employee) {
            return $this->successResponse(
                $this->hrService->mySummary($employee),
                'HR summary retrieved successfully.'
            );
        }

        return $this->successResponse(
            $this->hrService->summary(),
            'HR summary retrieved successfully.'
        );
    }

    public function profile(): JsonResponse
    {
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && $user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->successResponse(
                (new EmployeeHrResource)->additional(['message' => 'No employee profile found for this admin user.']),
                'HR profile retrieved successfully.'
            );
        }

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
