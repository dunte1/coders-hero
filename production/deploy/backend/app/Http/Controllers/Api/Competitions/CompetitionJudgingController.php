<?php

namespace App\Http\Controllers\Api\Competitions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Competitions\SubmitCompetitionScoreRequest;
use App\Models\Competition;
use App\Services\Competitions\CompetitionJudgingService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetitionJudgingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CompetitionJudgingService $judgingService
    ) {}

    public function leaderboard(int $id): JsonResponse
    {
        try {
            $competition = Competition::findOrFail($id);
            $leaderboard = $this->judgingService->leaderboard(auth()->user(), $competition);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($leaderboard);
    }

    public function results(int $id): JsonResponse
    {
        try {
            $competition = Competition::findOrFail($id);
            $results = $this->judgingService->results(auth()->user(), $competition);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($results);
    }

    public function scores(Request $request, int $id): JsonResponse
    {
        try {
            $competition = Competition::findOrFail($id);
            $scores = $this->judgingService->scores(auth()->user(), $competition);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($scores);
    }

    public function submitScores(SubmitCompetitionScoreRequest $request, int $id): JsonResponse
    {
        try {
            $competition = Competition::findOrFail($id);
            $team = $this->judgingService->submitScores(
                auth()->user(),
                $competition,
                (int) $request->input('team_id'),
                $request->input('scores')
            );
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Competition or team not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($team, 'Scores submitted.');
    }

    public function verifyScore(int $scoreId): JsonResponse
    {
        try {
            $score = $this->judgingService->verifyScore(auth()->user(), $scoreId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Score not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($score, 'Score verified.');
    }
}
