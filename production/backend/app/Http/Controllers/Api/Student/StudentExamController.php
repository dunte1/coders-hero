<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Services\StudentExamService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentExamController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StudentExamService $examService
    ) {}

    public function availableExams(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $exams = $this->examService->availableExams($user);

            return $this->successResponse($exams, 'Available exams retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve exams: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $exam = $this->examService->show($user, $id);

            if (!$exam) {
                return $this->notFoundResponse('Exam not found.');
            }

            return $this->successResponse($exam, 'Exam retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve exam: ' . $e->getMessage(), 500);
        }
    }

    public function startAttempt(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $attempt = $this->examService->startAttempt($user, $id);

            if (!$attempt) {
                return $this->errorResponse('Unable to start attempt. You may have an existing attempt or the exam is not available.', 422);
            }

            return $this->createdResponse($attempt, 'Exam attempt started successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to start attempt: ' . $e->getMessage(), 500);
        }
    }

    public function submitAttempt(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'answers' => ['required', 'array'],
            ]);

            $user = Auth::user();
            $attempt = $this->examService->submitAttempt($user, $id, $request->input('answers'));

            if (!$attempt) {
                return $this->errorResponse('No active attempt found for this exam.', 422);
            }

            return $this->successResponse($attempt, 'Exam submitted successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), 'Validation failed.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to submit attempt: ' . $e->getMessage(), 500);
        }
    }

    public function myAttempts(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $attempts = $this->examService->myAttempts($user);

            return $this->successResponse($attempts, 'Exam attempts retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve attempts: ' . $e->getMessage(), 500);
        }
    }
}
