<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\AssignmentSubmission;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentAssignmentController extends Controller
{
    use ApiResponse;

    public function __construct(private ParentPortalService $portal) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $studentIds = $this->portal->accessibleStudentIds();

            $submissions = AssignmentSubmission::whereIn('student_id', $studentIds)
                ->with(['assignment.teacher', 'assignment.course', 'student'])
                ->latest('updated_at')
                ->paginate((int) $request->get('per_page', 15));

            return $this->paginatedResponse($submissions, 'Assignments retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve assignments: ' . $e->getMessage(), 500);
        }
    }
}
