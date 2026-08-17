<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\EnrollCourseRequest;
use App\Http\Resources\EnrollmentResource;
use App\Services\EnrollmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private EnrollmentService $enrollmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $enrollments = $this->enrollmentService->getMyCourses(auth()->id(), $perPage);

        return $this->paginatedResponse($enrollments, 'Enrollments retrieved successfully.');
    }

    public function enroll(EnrollCourseRequest $request): JsonResponse
    {
        $enrollment = $this->enrollmentService->enroll(auth()->id(), $request->course_id);

        return $this->createdResponse(
            new EnrollmentResource($enrollment->load(['course', 'course.category', 'course.instructor'])),
            'Enrolled successfully.'
        );
    }

    public function unenroll(int $courseId): JsonResponse
    {
        $this->enrollmentService->unenroll(auth()->id(), $courseId);

        return $this->noContentResponse('Unenrolled successfully.');
    }

    public function show(int $courseId): JsonResponse
    {
        $enrollment = $this->enrollmentService->show(auth()->id(), $courseId);

        if (!$enrollment) {
            return $this->notFoundResponse('Enrollment not found.');
        }

        return $this->successResponse(
            new EnrollmentResource($enrollment->load(['course', 'course.lessons', 'course.category', 'course.instructor'])),
            'Enrollment retrieved successfully.'
        );
    }

    public function updateProgress(Request $request, int $lessonId): JsonResponse
    {
        $enrollment = $this->enrollmentService->updateProgress(auth()->id(), $lessonId);

        return $this->successResponse(
            new EnrollmentResource($enrollment->load(['course'])),
            'Progress updated successfully.'
        );
    }

    public function myCourses(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');

        if ($status === 'completed') {
            $enrollments = $this->enrollmentService->getMyCourses(auth()->id(), $perPage);
        } else {
            $enrollments = $this->enrollmentService->getMyCourses(auth()->id(), $perPage);
        }

        return $this->paginatedResponse($enrollments, 'My courses retrieved successfully.');
    }

    public function stats(): JsonResponse
    {
        $stats = $this->enrollmentService->getEnrollmentStats(auth()->id());

        return $this->successResponse($stats, 'Enrollment stats retrieved successfully.');
    }
}
