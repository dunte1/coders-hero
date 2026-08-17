<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\GradeExamResultsRequest;
use App\Http\Requests\Teacher\StoreExamRequest;
use App\Http\Requests\Teacher\UpdateExamRequest;
use App\Services\Teachers\ExamService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherExamController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ExamService $examService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $exams = $this->examService->getAll(
            auth()->id(),
            $request->only(['class_id', 'type', 'status', 'search']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($exams, 'Exams retrieved successfully.');
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $exam = $this->examService->create(auth()->id(), $request->validated());

        if ($exam->status === 'scheduled') {
            $this->notifyClass($exam);
        }

        return $this->createdResponse($exam, 'Exam created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $exam = $this->examService->getById($id, auth()->id());

        if (!$exam) {
            return $this->notFoundResponse('Exam not found.');
        }

        return $this->successResponse([
            'exam' => $exam,
            'summary' => $this->examService->resultSummary($exam),
        ], 'Exam retrieved successfully.');
    }

    public function update(UpdateExamRequest $request, int $id): JsonResponse
    {
        try {
            $exam = $this->examService->update($id, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($exam, 'Exam updated successfully.');
    }

    private function notifyClass($exam): void
    {
        $class = $exam->schoolClass;
        $course = $exam->course;

        if (!$class) {
            return;
        }

        $students = $class->students()->with('user')->get();

        foreach ($students as $student) {
            $user = $student->user;

            if (!$user) {
                continue;
            }

            app(\App\Services\Notifications\NotificationDispatcher::class)->notify(
                $user,
                'exam.scheduled',
                [
                    'title' => 'Exam scheduled: ' . $exam->title,
                    'user_name' => $user->name ?? 'there',
                    'exam_title' => $exam->title,
                    'course_name' => $course?->title ?? 'your class',
                    'exam_date' => $exam->scheduled_at
                        ? $exam->scheduled_at->format('M j, Y')
                        : 'TBA',
                    'exam_time' => $exam->scheduled_at
                        ? $exam->scheduled_at->format('g:i A')
                        : 'TBA',
                ],
                '/exams/' . $exam->id
            );
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->examService->delete($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Exam deleted successfully.');
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'in:draft,scheduled,in_progress,completed,cancelled']]);

        try {
            $exam = $this->examService->changeStatus($id, auth()->id(), $request->get('status'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($exam, 'Exam status updated successfully.');
    }

    public function gradeResults(GradeExamResultsRequest $request, int $id): JsonResponse
    {
        try {
            $exam = $this->examService->gradeResults($id, auth()->id(), $request->validated('entries'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($exam, 'Exam results recorded successfully.');
    }

    public function markAbsent(Request $request, int $id): JsonResponse
    {
        $request->validate(['student_ids' => ['required', 'array', 'min:1']]);

        try {
            $exam = $this->examService->markResultAbsent($id, auth()->id(), $request->validated('student_ids'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($exam, 'Students marked absent successfully.');
    }
}
