<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\RateCourseRequest;
use App\Services\Lms\RatingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RatingService $ratingService
    ) {}

    public function index(Request $request, int $courseId): JsonResponse
    {
        $ratings = $this->ratingService->forCourse($courseId, (int) $request->get('per_page', 15));

        return $this->paginatedResponse($ratings, 'Course ratings retrieved successfully.');
    }

    public function rate(RateCourseRequest $request, int $courseId): JsonResponse
    {
        $rating = $this->ratingService->rate(
            auth()->id(),
            $courseId,
            (int) $request->validated('rating'),
            $request->validated('review')
        );

        return $this->createdResponse($rating, 'Rating submitted successfully.');
    }

    public function my(int $courseId): JsonResponse
    {
        return $this->successResponse(
            $this->ratingService->userRating(auth()->id(), $courseId),
            'Your rating retrieved successfully.'
        );
    }

    public function summary(int $courseId): JsonResponse
    {
        return $this->successResponse(
            $this->ratingService->summary($courseId),
            'Rating summary retrieved successfully.'
        );
    }
}
