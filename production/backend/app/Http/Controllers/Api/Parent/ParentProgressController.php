<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\CodingProgress;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ParentProgressController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function index(): JsonResponse
    {
        $studentIds = $this->portalService->accessibleStudentIds();

        $progress = CodingProgress::with('student')
            ->whereIn('student_id', $studentIds)
            ->orderBy('student_id')
            ->get()
            ->groupBy('student_id')
            ->map(function ($items) {
                return [
                    'skills' => $items->values(),
                    'average_progress' => round($items->avg('progress'), 1),
                    'total_skills' => $items->count(),
                    'completed_skills' => $items->where('progress', '>=', 100)->count(),
                ];
            });

        return $this->successResponse($progress, 'Coding progress retrieved successfully.');
    }
}
