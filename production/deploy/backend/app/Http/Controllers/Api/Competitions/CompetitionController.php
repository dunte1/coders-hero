<?php

namespace App\Http\Controllers\Api\Competitions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Competitions\AssignCompetitionJudgeRequest;
use App\Http\Requests\Competitions\ChangeCompetitionStatusRequest;
use App\Http\Requests\Competitions\StoreCompetitionCriterionRequest;
use App\Http\Requests\Competitions\StoreCompetitionRequest;
use App\Http\Requests\Competitions\UpdateCompetitionCriterionRequest;
use App\Http\Requests\Competitions\UpdateCompetitionRequest;
use App\Services\Competitions\CompetitionService;
use App\Services\Notifications\NotificationDispatcher;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetitionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CompetitionService $competitionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $competitions = $this->competitionService->index(
            auth()->user(),
            $request->only(['type', 'status', 'search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($competitions);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $competition = $this->competitionService->show(auth()->user(), $id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($competition);
    }

    public function store(StoreCompetitionRequest $request): JsonResponse
    {
        try {
            $competition = $this->competitionService->store(auth()->user(), $request->validated());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->createdResponse($competition, 'Competition created.');
    }

    public function update(UpdateCompetitionRequest $request, int $id): JsonResponse
    {
        try {
            $competition = $this->competitionService->update(auth()->user(), $id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($competition, 'Competition updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->competitionService->destroy(auth()->user(), $id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->noContentResponse('Competition deleted.');
    }

    public function changeStatus(ChangeCompetitionStatusRequest $request, int $id): JsonResponse
    {
        try {
            $competition = $this->competitionService->changeStatus(auth()->user(), $id, $request->input('status'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        $this->notifyTeams($competition, $request->input('status'));

        return $this->successResponse($competition, 'Competition status updated.');
    }

    private function notifyTeams($competition, string $newStatus): void
    {
        $message = match ($newStatus) {
            'open' => 'Registration for is now open',
            'registration_closed' => 'Registration has closed',
            'judging' => 'Judging has started',
            'results_published' => 'Results have been published',
            default => 'Status updated',
        };

        $statusMap = [
            'draft' => 'Draft',
            'open' => 'Open',
            'registration_closed' => 'Registration Closed',
            'judging' => 'Judging In Progress',
            'results_published' => 'Results Published',
            'cancelled' => 'Cancelled',
        ];

        $label = $statusMap[$newStatus] ?? ucfirst(str_replace('_', ' ', $newStatus));

        $teams = $competition->teams()->with(['members.user', 'leader.user'])->get();

        $notified = [];

        foreach ($teams as $team) {
            foreach ($team->members as $member) {
                $user = $member->user ?? $team->leader?->user;

                if (!$user || isset($notified[$user->id])) {
                    continue;
                }

                $notified[$user->id] = true;

                app(NotificationDispatcher::class)->notify(
                    $user,
                    'competition.announcement',
                    [
                        'title' => $competition->name . ' — ' . $label,
                        'user_name' => $user->name ?? 'there',
                        'competition_name' => $competition->name,
                        'message' => $message . '. Check the competition page for details.',
                    ],
                    '/competitions/' . $competition->id
                );
            }
        }
    }

    public function storeCriterion(StoreCompetitionCriterionRequest $request, int $id): JsonResponse
    {
        try {
            $criterion = $this->competitionService->storeCriterion(auth()->user(), $id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->createdResponse($criterion, 'Criterion added.');
    }

    public function updateCriterion(UpdateCompetitionCriterionRequest $request, int $criterionId): JsonResponse
    {
        try {
            $criterion = $this->competitionService->updateCriterion(auth()->user(), $criterionId, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Criterion not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($criterion, 'Criterion updated.');
    }

    public function deleteCriterion(int $criterionId): JsonResponse
    {
        try {
            $this->competitionService->deleteCriterion(auth()->user(), $criterionId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Criterion not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->noContentResponse('Criterion deleted.');
    }

    public function assignJudge(AssignCompetitionJudgeRequest $request, int $id): JsonResponse
    {
        try {
            $competition = $this->competitionService->assignJudge(
                auth()->user(),
                $id,
                $request->input('user_id'),
                $request->input('title')
            );
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($competition, 'Judge assigned.');
    }

    public function removeJudge(int $id, int $userId): JsonResponse
    {
        try {
            $competition = $this->competitionService->removeJudge(auth()->user(), $id, $userId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($competition, 'Judge removed.');
    }

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->competitionService->summary());
    }
}
