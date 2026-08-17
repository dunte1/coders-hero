<?php

namespace App\Http\Controllers\Api\Competitions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Competitions\AddCompetitionTeamMemberRequest;
use App\Http\Requests\Competitions\RegisterCompetitionTeamRequest;
use App\Http\Requests\Competitions\SubmitCompetitionTeamRequest;
use App\Models\Competition;
use App\Models\CompetitionTeam;
use App\Services\Competitions\CompetitionRegistrationService;
use App\Services\Notifications\NotificationDispatcher;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetitionRegistrationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CompetitionRegistrationService $registrationService
    ) {}

    public function register(RegisterCompetitionTeamRequest $request, int $id): JsonResponse
    {
        try {
            $competition = Competition::findOrFail($id);
            $team = $this->registrationService->registerTeam(auth()->user(), $competition, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        app(NotificationDispatcher::class)->notify(
            auth()->user(),
            'competition.announcement',
            [
                'title' => 'Registered for ' . $competition->name,
                'user_name' => auth()->user()->name ?? 'there',
                'competition_name' => $competition->name,
                'message' => 'Your team registration was successful',
            ],
            '/competitions/' . $competition->id
        );

        return $this->createdResponse($team, 'Team registered.');
    }

    public function studentOptions(Request $request): JsonResponse
    {
        $students = $this->registrationService->searchStudents($request->get('search'), (int) $request->get('limit', 20));

        return $this->successResponse($students);
    }

    public function myTeams(): JsonResponse
    {
        return $this->successResponse($this->registrationService->myRegistrations(auth()->user()));
    }

    public function showTeam(Request $request, int $teamId): JsonResponse
    {
        try {
            $team = CompetitionTeam::with(['competition', 'leader', 'members', 'scores.criterion', 'scores.judge'])
                ->withCount('members')
                ->findOrFail($teamId);

            $competition = $team->competition;
            $user = auth()->user();

            $isStaff = $user->hasAnyRole(['admin', 'super_admin', 'teacher', 'instructor']);
            $isJudge = $competition->hasJudge($user->id);
            $isMember = $team->hasMember($this->registrationService->studentForUser($user)?->id ?? -1);

            if (!$isStaff && !$isJudge && !$isMember && !$competition->isPublished()) {
                return $this->forbiddenResponse('You do not have access to this team.');
            }
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        }

        return $this->successResponse($team);
    }

    public function addMember(AddCompetitionTeamMemberRequest $request, int $teamId): JsonResponse
    {
        try {
            $team = CompetitionTeam::findOrFail($teamId);
            $team = $this->registrationService->addMember(
                auth()->user(),
                $team,
                (int) $request->input('student_id'),
                $request->input('role', 'member')
            );
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($team, 'Member added.');
    }

    public function removeMember(int $teamId, int $studentId): JsonResponse
    {
        try {
            $team = CompetitionTeam::findOrFail($teamId);
            $team = $this->registrationService->removeMember(auth()->user(), $team, $studentId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($team, 'Member removed.');
    }

    public function submit(SubmitCompetitionTeamRequest $request, int $teamId): JsonResponse
    {
        try {
            $team = CompetitionTeam::findOrFail($teamId);
            $team = $this->registrationService->submitProject(auth()->user(), $team, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($team, 'Project submitted.');
    }

    public function disqualify(Request $request, int $teamId): JsonResponse
    {
        try {
            $team = CompetitionTeam::findOrFail($teamId);
            $team = $this->registrationService->disqualify(auth()->user(), $team, (bool) $request->input('disqualified', true));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($team, 'Team status updated.');
    }
}
