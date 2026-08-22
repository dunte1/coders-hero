<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Student;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentCourseController extends Controller
{
    use ApiResponse;

    public function __construct(private ParentPortalService $portal) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $studentIds = $this->portal->accessibleStudentIds();
            $userIds = Student::whereIn('id', $studentIds)->pluck('user_id')->all();

            $courses = Course::whereHas('enrollments', function ($q) use ($userIds) {
                $q->whereIn('user_id', $userIds);
            })->with('category')->latest()->paginate((int) $request->get('per_page', 15));

            return $this->paginatedResponse($courses, 'Courses retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve courses: ' . $e->getMessage(), 500);
        }
    }
}
