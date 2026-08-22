<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\StudentProject;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentProjectController extends Controller
{
    use ApiResponse;

    public function __construct(private ParentPortalService $portal) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $studentIds = $this->portal->accessibleStudentIds();

            $projects = StudentProject::whereIn('student_id', $studentIds)
                ->with(['student', 'media', 'reviews'])
                ->latest()
                ->paginate((int) $request->get('per_page', 15));

            return $this->paginatedResponse($projects, 'Projects retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve projects: ' . $e->getMessage(), 500);
        }
    }
}
