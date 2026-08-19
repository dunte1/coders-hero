<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\GradeSubmissionRequest;
use App\Http\Requests\Teacher\StoreAssignmentRequest;
use App\Http\Requests\Teacher\UpdateAssignmentRequest;
use App\Services\Teachers\AssignmentService;
use App\Traits\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherAssignmentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AssignmentService $assignmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $assignments = $this->assignmentService->getAll(
            auth()->id(),
            $request->only(['class_id', 'course_id', 'status', 'search']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($assignments, 'Assignments retrieved successfully.');
    }

    public function store(StoreAssignmentRequest $request): JsonResponse
    {
        $assignment = $this->assignmentService->create(auth()->id(), $request->validated());

        return $this->createdResponse($assignment, 'Assignment created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $assignment = $this->assignmentService->getById($id, auth()->id());

        if (!$assignment) {
            return $this->notFoundResponse('Assignment not found.');
        }

        return $this->successResponse($assignment, 'Assignment retrieved successfully.');
    }

    public function update(UpdateAssignmentRequest $request, int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->update($id, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($assignment, 'Assignment updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->assignmentService->delete($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Assignment deleted successfully.');
    }

    public function publish(int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->publish($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        $this->notifyClass($assignment);

        return $this->successResponse($assignment, 'Assignment published successfully.');
    }

    private function notifyClass($assignment): void
    {
        $class = $assignment->schoolClass;
        $course = $assignment->course;

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
                'assignment.published',
                [
                    'title' => 'New assignment: ' . $assignment->title,
                    'user_name' => $user->name ?? 'there',
                    'assignment_title' => $assignment->title,
                    'course_name' => $course?->title ?? 'your class',
                    'due_date' => $assignment->due_at
                        ? $assignment->due_at->format('M j, Y g:i A')
                        : 'TBA',
                ],
                '/assignments/' . $assignment->id
            );
        }
    }

    public function close(int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->close($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($assignment, 'Assignment closed successfully.');
    }

    public function submissions(Request $request, int $id): JsonResponse
    {
        try {
            $submissions = $this->assignmentService->submissions(
                $id,
                auth()->id(),
                $request->only(['status', 'search']),
                (int) $request->get('per_page', 20)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->paginatedResponse($submissions, 'Submissions retrieved successfully.');
    }

    public function gradeSubmission(GradeSubmissionRequest $request, int $id, int $submissionId): JsonResponse
    {
        try {
            $submission = $this->assignmentService->gradeSubmission($submissionId, auth()->id(), $request->validated());
        } catch (AuthorizationException $e) {
            return $this->forbiddenResponse($e->getMessage());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($submission, 'Submission graded successfully.');
    }

    public function missingList(int $id): JsonResponse
    {
        try {
            $missing = $this->assignmentService->missingList($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($missing, 'Missing submissions retrieved successfully.');
    }
}
