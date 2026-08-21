<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsDashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    private function filters(Request $request): array
    {
        return $request->only(['from', 'to', 'branch']);
    }

    public function overview(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->overview($this->filters($request)),
            'Analytics overview retrieved.'
        );
    }

    public function enrollments(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->enrollments($this->filters($request)),
            'Enrollment analytics retrieved.'
        );
    }

    public function revenue(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->revenue($this->filters($request)),
            'Revenue analytics retrieved.'
        );
    }

    public function attendance(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->attendance($this->filters($request)),
            'Attendance analytics retrieved.'
        );
    }

    public function courses(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->courses($this->filters($request)),
            'Course analytics retrieved.'
        );
    }

    public function teachers(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->teachers($this->filters($request)),
            'Teacher performance retrieved.'
        );
    }

    public function competitions(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->competitions($this->filters($request)),
            'Competition analytics retrieved.'
        );
    }

    public function branches(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->branches($this->filters($request)),
            'Branch performance retrieved.'
        );
    }

    public function progress(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->progress($this->filters($request)),
            'Student progress retrieved.'
        );
    }

    public function filterOptions(): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->filterOptions(),
            'Analytics filter options retrieved.'
        );
    }
}
