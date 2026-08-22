<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentCompetitionController extends Controller
{
    use ApiResponse;

    public function __construct(private ParentPortalService $portal) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $studentIds = $this->portal->accessibleStudentIds();

            $competitions = Competition::whereHas('teams', function ($q) use ($studentIds) {
                $q->whereHas('members', fn ($m) => $m->whereIn('student_id', $studentIds));
            })->with(['teams' => function ($q) use ($studentIds) {
                $q->whereHas('members', fn ($m) => $m->whereIn('student_id', $studentIds));
            }])->latest()->paginate((int) $request->get('per_page', 15));

            return $this->paginatedResponse($competitions, 'Competitions retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve competitions: ' . $e->getMessage(), 500);
        }
    }
}
