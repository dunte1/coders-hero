<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\ManageClassStudentsRequest;
use App\Http\Requests\Teacher\RecordAttendanceRequest;
use App\Http\Requests\Teacher\StoreClassRequest;
use App\Http\Requests\Teacher\UpdateClassRequest;
use App\Services\Teachers\TeacherClassService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherClassController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TeacherClassService $classService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $classes = $this->classService->getAll(
            auth()->id(),
            $request->only(['search', 'status']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($classes, 'Classes retrieved successfully.');
    }

    public function grades(): JsonResponse
    {
        return $this->successResponse(
            $this->classService->grades(),
            'Grades retrieved successfully.'
        );
    }

    public function availableStudents(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->classService->studentsByGrade($request->get('grade')),
            'Available students retrieved successfully.'
        );
    }

    public function store(StoreClassRequest $request): JsonResponse
    {
        $class = $this->classService->create(auth()->id(), $request->validated());

        return $this->createdResponse($class, 'Class created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $class = $this->classService->getById($id, auth()->id());

        if (!$class) {
            return $this->notFoundResponse('Class not found.');
        }

        return $this->successResponse($class, 'Class retrieved successfully.');
    }

    public function update(UpdateClassRequest $request, int $id): JsonResponse
    {
        try {
            $class = $this->classService->update($id, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($class, 'Class updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->classService->delete($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Class deleted successfully.');
    }

    public function addStudents(ManageClassStudentsRequest $request, int $id): JsonResponse
    {
        try {
            $class = $this->classService->addStudents($id, auth()->id(), $request->validated('student_ids'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($class, 'Students added successfully.');
    }

    public function removeStudent(int $id, int $studentId): JsonResponse
    {
        try {
            $class = $this->classService->removeStudent($id, auth()->id(), $studentId);
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($class, 'Student removed successfully.');
    }

    public function roster(Request $request, int $id): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());

        try {
            $roster = $this->classService->roster($id, auth()->id(), $date);
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse([
            'date' => $date,
            'roster' => $roster,
        ], 'Roster retrieved successfully.');
    }

    public function recordAttendance(RecordAttendanceRequest $request, int $id): JsonResponse
    {
        try {
            $records = $this->classService->recordAttendance(
                $id,
                auth()->id(),
                $request->validated('date'),
                $request->validated('entries')
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($records, 'Attendance recorded successfully.');
    }

    public function attendanceSummary(Request $request, int $id): JsonResponse
    {
        try {
            $summary = $this->classService->attendanceSummary($id, auth()->id(), $request->get('month'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($summary, 'Attendance summary retrieved successfully.');
    }
}
