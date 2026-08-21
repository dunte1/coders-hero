<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Services\Website\AnalyticsService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    use ApiResponse;

    public function __construct(private AnalyticsService $analyticsService) {}

    public function site(): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->siteStats(),
            'Website analytics retrieved successfully.'
        );
    }
}
