<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\MarkLessonCompletedRequest;
use App\Http\Requests\Lms\UpdateVideoProgressRequest;
use App\Services\Lms\VideoProgressService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoProgressController extends Controller
{
    use ApiResponse;

    public function __construct(
        private VideoProgressService $progressService
    ) {}

    public function update(UpdateVideoProgressRequest $request, int $lessonId): JsonResponse
    {
        $progress = $this->progressService->update(
            auth()->id(),
            $lessonId,
            (int) $request->validated('watched_seconds'),
            $request->validated('duration_seconds') !== null ? (int) $request->validated('duration_seconds') : null,
            $request->validated('completed') !== null ? (bool) $request->validated('completed') : null
        );

        return $this->successResponse($progress, 'Progress updated successfully.');
    }

    public function forLesson(int $lessonId): JsonResponse
    {
        $progress = $this->progressService->forLesson(auth()->id(), $lessonId);

        return $this->successResponse($progress, 'Lesson progress retrieved successfully.');
    }

    public function forCourse(int $courseId): JsonResponse
    {
        $progress = $this->progressService->forCourse(auth()->id(), $courseId);

        return $this->successResponse($progress, 'Course progress retrieved successfully.');
    }

    public function markCompleted(MarkLessonCompletedRequest $request, int $courseId): JsonResponse
    {
        try {
            $result = $this->progressService->markCompleted(
                auth()->id(),
                $courseId,
                $request->validated('lesson_id')
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($result, 'Lesson marked as completed.');
    }
}
