<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quiz\StoreQuizRequest;
use App\Http\Requests\Quiz\SubmitQuizRequest;
use App\Http\Requests\Quiz\UpdateQuizRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\QuizQuestionResource;
use App\Http\Resources\QuizResource;
use App\Services\QuizService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    use ApiResponse;

    public function __construct(
        private QuizService $quizService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $quizzes = $this->quizService->getAll($perPage);

        return $this->paginatedResponse($quizzes, 'Quizzes retrieved successfully.');
    }

    public function store(StoreQuizRequest $request): JsonResponse
    {
        $quiz = $this->quizService->create($request->validated());

        return $this->createdResponse(
            new QuizResource($quiz),
            'Quiz created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $quiz = $this->quizService->getById($id);

        if (!$quiz) {
            return $this->notFoundResponse('Quiz not found.');
        }

        return $this->successResponse(
            new QuizResource($quiz),
            'Quiz retrieved successfully.'
        );
    }

    public function questions(int $id): JsonResponse
    {
        $quiz = $this->quizService->getById($id);

        if (!$quiz) {
            return $this->notFoundResponse('Quiz not found.');
        }

        return $this->successResponse(
            QuizQuestionResource::collection($quiz->questions),
            'Quiz questions retrieved successfully.'
        );
    }

    public function update(UpdateQuizRequest $request, int $id): JsonResponse
    {
        $quiz = $this->quizService->update($id, $request->validated());

        return $this->successResponse(
            new QuizResource($quiz),
            'Quiz updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->quizService->delete($id);

        return $this->noContentResponse('Quiz deleted successfully.');
    }

    public function submit(SubmitQuizRequest $request, int $id): JsonResponse
    {
        $attempt = $this->quizService->submitAttempt(auth()->id(), $id, $request->answers);

        return $this->createdResponse(
            new QuizAttemptResource($attempt->load('quiz')),
            'Quiz submitted successfully.'
        );
    }

    public function attempts(Request $request, int $id): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $attempts = $this->quizService->getAttemptHistory(auth()->id(), $id, $perPage);

        return $this->paginatedResponse($attempts, 'Quiz attempts retrieved successfully.');
    }

    public function statistics(int $id): JsonResponse
    {
        $stats = $this->quizService->getStatistics($id);

        return $this->successResponse($stats, 'Quiz statistics retrieved successfully.');
    }

    public function byCourse(Request $request, int $courseId): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $quizzes = $this->quizService->findByCourse($courseId, $perPage);

        return $this->paginatedResponse($quizzes, 'Quizzes retrieved successfully.');
    }
}
