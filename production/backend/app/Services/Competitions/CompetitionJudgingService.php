<?php

namespace App\Services\Competitions;

use App\Models\Competition;
use App\Models\CompetitionScore;
use App\Models\CompetitionTeam;
use App\Models\User;

class CompetitionJudgingService
{
    use CompetitionAccess;

    public function submitScores(User $judge, Competition $competition, int $teamId, array $scores): CompetitionTeam
    {
        if (!$this->canJudge($judge, $competition)) {
            throw new \RuntimeException('You are not assigned as a judge for this competition.', 403);
        }

        if (!$competition->allowsScoring()) {
            throw new \RuntimeException('Scoring is not open for this competition.', 422);
        }

        $team = $competition->teams()->findOrFail($teamId);

        if ($team->status === 'disqualified') {
            throw new \RuntimeException('This team has been disqualified and cannot be scored.', 422);
        }

        $criteria = $competition->criteria()->get()->keyBy('id');

        foreach ($scores as $entry) {
            $criterion = $criteria->get($entry['criterion_id'] ?? null);

            if (!$criterion) {
                throw new \InvalidArgumentException('One of the selected criteria is not part of this competition.');
            }

            $value = (int) $entry['score'];

            if ($value < 0 || $value > $criterion->max_score) {
                throw new \InvalidArgumentException(
                    "Score for '{$criterion->name}' must be between 0 and {$criterion->max_score}."
                );
            }

            CompetitionScore::updateOrCreate(
                [
                    'competition_id' => $competition->id,
                    'competition_team_id' => $team->id,
                    'criterion_id' => $criterion->id,
                    'judge_user_id' => $judge->id,
                ],
                [
                    'score' => $value,
                    'remarks' => $entry['remarks'] ?? null,
                    'submitted_at' => now(),
                    'verified_by_user_id' => null,
                    'verified_at' => null,
                ]
            );
        }

        return $team->fresh(['scores.criterion', 'scores.judge', 'members', 'leader']);
    }

    public function scores(User $user, Competition $competition): array
    {
        if (!$this->canAccessScores($user, $competition)) {
            throw new \RuntimeException('You do not have access to the scores of this competition.', 403);
        }

        $query = CompetitionScore::query()
            ->with(['team', 'criterion', 'judge', 'verifiedBy'])
            ->where('competition_id', $competition->id);

        if (!$this->isStaff($user)) {
            $query->where('judge_user_id', $user->id);
        }

        return $query->orderBy('competition_team_id')->orderBy('criterion_id')->get()->toArray();
    }

    public function verifyScore(User $user, int $scoreId): CompetitionScore
    {
        if (!$this->isStaff($user)) {
            throw new \RuntimeException('Only staff can verify scores.', 403);
        }

        $score = CompetitionScore::with(['team', 'criterion', 'judge', 'verifiedBy'])->findOrFail($scoreId);

        $score->update([
            'verified_by_user_id' => $user->id,
            'verified_at' => now(),
        ]);

        return $score->fresh(['team', 'criterion', 'judge', 'verifiedBy']);
    }

    public function leaderboard(User $user, Competition $competition): array
    {
        if (!$this->canAccessCompetition($user, $competition)) {
            throw new \RuntimeException('You do not have access to this competition.', 403);
        }

        $criteria = $competition->criteria()->orderBy('sort_order')->get();
        $maxTotal = $criteria->sum(fn ($c) => $c->max_score * $c->weight);

        $teams = $competition->teams()
            ->with(['scores.criterion', 'scores.judge', 'leader', 'members'])
            ->withCount('members')
            ->get()
            ->reject(fn ($team) => $team->status === 'disqualified');

        $rows = $teams->map(function (CompetitionTeam $team) use ($criteria) {
            $total = 0;
            $verified = 0;
            $scoreCount = 0;
            $breakdown = [];

            foreach ($criteria as $criterion) {
                $criterionScores = $team->scores->where('criterion_id', $criterion->id);
                $average = $criterionScores->count() > 0
                    ? round($criterionScores->avg('score'), 2)
                    : null;

                if ($average !== null) {
                    $total += $average * $criterion->weight;
                    $scoreCount += $criterionScores->count();
                    $verified += $criterionScores->filter(fn ($s) => $s->isVerified())->count();
                }

                $breakdown[] = [
                    'criterion_id' => $criterion->id,
                    'name' => $criterion->name,
                    'max_score' => $criterion->max_score,
                    'weight' => $criterion->weight,
                    'average_score' => $average,
                    'judge_count' => $criterionScores->count(),
                ];
            }

            return [
                'team' => [
                    'id' => $team->id,
                    'name' => $team->name,
                    'project_title' => $team->project_title,
                    'status' => $team->status,
                    'submission_url' => $team->submission_url,
                    'member_count' => $team->members_count,
                    'leader' => $team->leader,
                    'members' => $team->members,
                ],
                'total_score' => round($total, 2),
                'max_score' => 0,
                'score_count' => $scoreCount,
                'verified_count' => $verified,
                'breakdown' => $breakdown,
            ];
        })->values();

        $maxTotal = $maxTotal > 0 ? $maxTotal : 1;

        $rows = $rows->map(function ($row) use ($maxTotal) {
            $row['max_score'] = $maxTotal;
            $row['percentage'] = round(($row['total_score'] / $maxTotal) * 100, 2);

            return $row;
        });

        return [
            'competition' => [
                'id' => $competition->id,
                'name' => $competition->name,
                'status' => $competition->status,
            ],
            'criteria' => $criteria->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'max_score' => $c->max_score,
                'weight' => $c->weight,
            ])->values(),
            'rankings' => $rows->sortByDesc('total_score')->values()
                ->map(function ($row, $index) {
                    $row['rank'] = $index + 1;

                    return $row;
                })->values(),
        ];
    }

    public function results(User $user, Competition $competition): array
    {
        if (!$this->canAccessCompetition($user, $competition)) {
            throw new \RuntimeException('You do not have access to this competition.', 403);
        }

        if (!$this->isStaff($user) && $competition->status !== 'completed') {
            throw new \RuntimeException('Results are only available after the competition is completed.', 403);
        }

        return $this->leaderboard($user, $competition);
    }

    private function canJudge(User $user, Competition $competition): bool
    {
        return $this->isStaff($user) || $competition->hasJudge($user->id);
    }

    private function canAccessScores(User $user, Competition $competition): bool
    {
        return $this->isStaff($user) || $competition->hasJudge($user->id);
    }
}
