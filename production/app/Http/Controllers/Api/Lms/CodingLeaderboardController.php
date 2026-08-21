<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Services\Lms\CodingLeaderboardService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CodingLeaderboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CodingLeaderboardService $leaderboardService
    ) {}

    public function forCourse(int $courseId, string $period = 'alltime'): JsonResponse
    {
        $data = $this->leaderboardService->forCourse($courseId, $period);

        return $this->successResponse($data);
    }

    public function forExercise(int $exerciseId, string $period = 'alltime'): JsonResponse
    {
        $data = $this->leaderboardService->forExercise($exerciseId, $period);

        return $this->successResponse($data);
    }
}