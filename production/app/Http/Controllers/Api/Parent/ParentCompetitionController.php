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

            if (empty($studentIds)) {
                return $this->successResponse(collect(), 'Competitions retrieved successfully.');
            }

            $teamIds = \Illuminate\Support\Facades\DB::table('competition_team_members')
                ->whereIn('student_id', $studentIds)
                ->pluck('competition_team_id')
                ->unique()
                ->all();

            if (empty($teamIds)) {
                return $this->successResponse(collect(), 'Competitions retrieved successfully.');
            }

            $competitions = Competition::whereIn('competitions.id', function ($q) use ($teamIds) {
                $q->select('competition_id')->from('competition_teams')->whereIn('id', $teamIds);
            })->with(['teams' => function ($q) {
                $q->with('members');
            }])->latest()->paginate((int) $request->get('per_page', 15));

            return $this->paginatedResponse($competitions, 'Competitions retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve competitions: ' . $e->getMessage(), 500);
        }
    }
}
