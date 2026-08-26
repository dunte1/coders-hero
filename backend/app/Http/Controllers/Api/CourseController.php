<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\EnrollCourseRequest;
use App\Http\Requests\Course\StoreCourseRequest;
use App\Http\Requests\Course\StoreLessonRequest;
use App\Http\Requests\Course\UpdateCourseRequest;
use App\Http\Resources\CourseDetailResource;
use App\Http\Resources\CourseResource;
use App\Http\Resources\LessonResource;
use App\Services\CourseService;
use App\Services\EnrollmentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CourseService $courseService,
        private EnrollmentService $enrollmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        $filters = $request->only(['category_id', 'level', 'instructor_id', 'min_price', 'max_price']);

        $courses = $this->courseService->search($search, $filters, $perPage);

        return $this->paginatedResponse($courses, 'Courses retrieved successfully.');
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['instructor_id'] = auth()->id();

        $course = $this->courseService->create($data);

        return $this->createdResponse(
            new CourseDetailResource($course),
            'Course created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $course = $this->courseService->getById($id);

        if (!$course) {
            return $this->notFoundResponse('Course not found.');
        }

        return $this->successResponse(
            new CourseDetailResource($course),
            'Course retrieved successfully.'
        );
    }

    public function update(UpdateCourseRequest $request, int $id): JsonResponse
    {
        $course = $this->courseService->getById($id);

        if (!$course) {
            return $this->notFoundResponse('Course not found.');
        }

        $this->authorize('update', $course);

        $course = $this->courseService->update($id, $request->validated());

        return $this->successResponse(
            new CourseDetailResource($course),
            'Course updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $course = $this->courseService->getById($id);

        if (!$course) {
            return $this->notFoundResponse('Course not found.');
        }

        $this->authorize('delete', $course);

        $this->courseService->delete($id);

        return $this->noContentResponse('Course deleted successfully.');
    }

    public function publish(int $id): JsonResponse
    {
        $course = $this->courseService->getById($id);

        if (!$course) {
            return $this->notFoundResponse('Course not found.');
        }

        $this->authorize('publish', $course);

        $course = $this->courseService->publish($id);

        return $this->successResponse(
            new CourseDetailResource($course),
            'Course published successfully.'
        );
    }

    public function archive(int $id): JsonResponse
    {
        $course = $this->courseService->getById($id);

        if (!$course) {
            return $this->notFoundResponse('Course not found.');
        }

        $this->authorize('archive', $course);

        $course = $this->courseService->archive($id);

        return $this->successResponse(
            new CourseDetailResource($course),
            'Course archived successfully.'
        );
    }

    public function duplicate(int $id): JsonResponse
    {
        $course = $this->courseService->duplicate($id);

        return $this->createdResponse(
            new CourseDetailResource($course),
            'Course duplicated successfully.'
        );
    }

    public function lessons(int $courseId): JsonResponse
    {
        $course = $this->courseService->getById($courseId);

        if (!$course) {
            return $this->notFoundResponse('Course not found.');
        }

        $lessons = $course->lessons()->orderBy('sort_order')->get();

        return $this->successResponse(
            LessonResource::collection($lessons),
            'Lessons retrieved successfully.'
        );
    }

    public function instructorCourses(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $courses = $this->courseService->findByInstructor(auth()->id(), $perPage);

        return $this->paginatedResponse($courses, 'Instructor courses retrieved successfully.');
    }

    public function featured(): JsonResponse
    {
        $courses = $this->courseService->getFeatured();

        return $this->successResponse(
            CourseResource::collection($courses),
            'Featured courses retrieved successfully.'
        );
    }

    public function popular(): JsonResponse
    {
        $courses = $this->courseService->getPopularCourses();

        return $this->successResponse(
            CourseResource::collection($courses),
            'Popular courses retrieved successfully.'
        );
    }

    public function recommended(Request $request): JsonResponse
    {
        $courses = $this->courseService->getRecommendedCourses(auth()->id());

        return $this->successResponse(
            CourseResource::collection($courses),
            'Recommended courses retrieved successfully.'
        );
    }

    public function stats(int $id): JsonResponse
    {
        $stats = $this->courseService->getCourseStats($id);

        return $this->successResponse($stats, 'Course stats retrieved successfully.');
    }
}
