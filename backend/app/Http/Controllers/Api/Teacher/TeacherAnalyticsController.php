<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Teachers\TeacherAnalyticsService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherAnalyticsController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TeacherAnalyticsService $analyticsService
    ) {}

    public function overview(): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->overview(auth()->id()),
            'Analytics overview retrieved successfully.'
        );
    }

    public function attendanceTrend(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 30);

        return $this->successResponse(
            $this->analyticsService->attendanceTrend(auth()->id(), $days),
            'Attendance trend retrieved successfully.'
        );
    }

    public function gradeDistribution(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->gradeDistribution(auth()->id(), $request->get('class_id')),
            'Grade distribution retrieved successfully.'
        );
    }

    public function classPerformance(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->classPerformance(auth()->id(), $request->get('class_id')),
            'Class performance retrieved successfully.'
        );
    }

    public function all(): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->perClass(auth()->id()),
            'Analytics retrieved successfully.'
        );
    }
}
