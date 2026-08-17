<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Teachers\TeacherDashboardService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class TeacherDashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TeacherDashboardService $dashboardService
    ) {}

    public function summary(): JsonResponse
    {
        return $this->successResponse(
            $this->dashboardService->summary(auth()->id()),
            'Dashboard summary retrieved successfully.'
        );
    }
}
