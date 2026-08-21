<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\SubmitCodingExerciseRequest;
use App\Services\Lms\CodingExerciseService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CodingExerciseController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CodingExerciseService $exerciseService
    ) {}

    public function index(Request $request, int $courseId): JsonResponse
    {
        $exercises = $this->exerciseService->list(
            $courseId,
            $request->only(['difficulty', 'language']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($exercises, 'Coding exercises retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $exercise = $this->exerciseService->getById($id, auth()->id());

        if (!$exercise) {
            return $this->notFoundResponse('Coding exercise not found.');
        }

        return $this->successResponse($exercise, 'Coding exercise retrieved successfully.');
    }

    public function submit(SubmitCodingExerciseRequest $request, int $id): JsonResponse
    {
        try {
            $submission = $this->exerciseService->submit(auth()->id(), $id, $request->validated('code'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->createdResponse($submission, 'Submission evaluated successfully.');
    }

    public function submissions(Request $request, int $id): JsonResponse
    {
        $submissions = $this->exerciseService->submissions(
            auth()->id(),
            $id,
            (int) $request->get('per_page', 10)
        );

        return $this->paginatedResponse($submissions, 'Submissions retrieved successfully.');
    }

    public function progress(int $courseId): JsonResponse
    {
        return $this->successResponse(
            $this->exerciseService->progress(auth()->id(), $courseId),
            'Coding progress retrieved successfully.'
        );
    }
}
