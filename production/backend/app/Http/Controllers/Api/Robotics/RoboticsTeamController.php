<?php

namespace App\Http\Controllers\Api\Robotics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Robotics\AddRoboticsTeamMemberRequest;
use App\Http\Requests\Robotics\StoreRoboticsTeamRequest;
use App\Http\Requests\Robotics\UpdateRoboticsTeamRequest;
use App\Models\Student;
use App\Services\Robotics\RoboticsTeamService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoboticsTeamController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoboticsTeamService $teamService
    ) {}

    public function students(): JsonResponse
    {
        $students = Student::query()
            ->active()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'grade'])
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'grade' => $student->grade,
            ]);

        return $this->successResponse($students->values());
    }

    public function index(Request $request): JsonResponse
    {
        $teams = $this->teamService->index($request->only(['search']), (int) $request->get('per_page', 15));

        return $this->paginatedResponse($teams);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $team = $this->teamService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        }

        return $this->successResponse($team);
    }

    public function store(StoreRoboticsTeamRequest $request): JsonResponse
    {
        $team = $this->teamService->store($request->validated());

        return $this->createdResponse($team, 'Team created.');
    }

    public function update(UpdateRoboticsTeamRequest $request, int $id): JsonResponse
    {
        try {
            $team = $this->teamService->update($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        }

        return $this->successResponse($team, 'Team updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->teamService->destroy($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->noContentResponse('Team deleted.');
    }

    public function addMember(AddRoboticsTeamMemberRequest $request, int $id): JsonResponse
    {
        try {
            $team = $this->teamService->addMember($id, (int) $request->validated('student_id'), $request->validated('role', 'member'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team or student not found.');
        }

        return $this->successResponse($team, 'Member added to team.');
    }

    public function removeMember(int $id, int $studentId): JsonResponse
    {
        try {
            $team = $this->teamService->removeMember($id, $studentId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        }

        return $this->successResponse($team, 'Member removed from team.');
    }
}
