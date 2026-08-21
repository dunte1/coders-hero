<?php

namespace App\Services\Competitions;

use App\Models\Competition;
use App\Models\CompetitionCriterion;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class CompetitionService
{
    use CompetitionAccess;

    private const TRANSITIONS = [
        'draft' => ['registration_open', 'cancelled'],
        'registration_open' => ['registration_closed', 'cancelled'],
        'registration_closed' => ['ongoing', 'cancelled'],
        'ongoing' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => ['registration_open'],
    ];

    public function index(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = Competition::query()
            ->withCount(['teams', 'criteria'])
            ->with(['createdBy'])
            ->byType($filters['type'] ?? null)
            ->byStatus($filters['status'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByDesc('start_date')
            ->orderByDesc('created_at');

        if (!$this->isStaff($user)) {
            if ($user->hasAnyRole(['judge'])) {
                $query->whereHas('judges', fn ($q) => $q->where('users.id', $user->id));
            } else {
                $query->whereIn('status', ['registration_open', 'registration_closed', 'ongoing', 'completed']);
            }
        }

        return $query->paginate($perPage);
    }

    public function show(User $user, int $id): Competition
    {
        $competition = Competition::query()
            ->withCount(['teams', 'criteria'])
            ->with([
                'createdBy',
                'judges',
                'criteria',
                'teams' => fn ($q) => $q->with(['leader', 'members'])->withCount('members'),
            ])
            ->findOrFail($id);

        if (!$this->canAccessCompetition($user, $competition)) {
            throw new \RuntimeException('You do not have access to this competition.', 403);
        }

        $competition->setRelation('judges', $competition->judges->map(function ($judge) {
            return $judge->setAttribute('title', $judge->pivot->title ?? null);
        }));

        return $competition;
    }

    public function store(User $user, array $data): Competition
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can create competitions.', 403);
        }

        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['created_by_user_id'] = $user->id;
        $data['status'] = $data['status'] ?? 'draft';

        return Competition::create($data);
    }

    public function update(User $user, int $id, array $data): Competition
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can update competitions.', 403);
        }

        $competition = Competition::findOrFail($id);

        if (isset($data['name']) && $data['name'] !== $competition->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $competition->id);
        }

        $competition->update($data);

        return $competition->fresh();
    }

    public function destroy(User $user, int $id): bool
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can delete competitions.', 403);
        }

        $competition = Competition::findOrFail($id);

        if ($competition->status === 'completed') {
            throw new \RuntimeException('Completed competitions cannot be deleted.', 422);
        }

        return (bool) $competition->delete();
    }

    public function changeStatus(User $user, int $id, string $status): Competition
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can change competition status.', 403);
        }

        $competition = Competition::findOrFail($id);

        if ($status === $competition->status) {
            return $competition->fresh();
        }

        $allowed = self::TRANSITIONS[$competition->status] ?? [];

        if (!in_array($status, $allowed, true)) {
            throw new \RuntimeException(
                "Cannot change competition status from '{$competition->status}' to '{$status}'.",
                422
            );
        }

        $competition->update(['status' => $status]);

        if ($status === 'completed') {
            $this->issueCompetitionCertificates($competition);
        }

        return $competition->fresh();
    }

    private function issueCompetitionCertificates(Competition $competition): void
    {
        $judgingService = app(CompetitionJudgingService::class);
        $systemUser = $competition->createdBy ?? User::first();

        if (!$systemUser) {
            return;
        }

        $results = $judgingService->leaderboard($systemUser, $competition);
        $rankings = $results['rankings'] ?? [];

        foreach ($rankings as $item) {
            $team = $item['team'] ?? [];
            $members = $team['members'] ?? [];

            foreach ($members as $member) {
                if (empty($member['user_id'])) {
                    continue;
                }

                \App\Models\Certificate::firstOrCreate(
                    [
                        'user_id' => $member['user_id'],
                        'verification_code' => 'COMP-' . $competition->id . '-' . $team['id'] . '-' . $member['id'],
                    ],
                    [
                        'certificate_number' => 'CERT-COMP-' . strtoupper(Str::random(8)),
                        'issued_at' => now(),
                    ]
                );
            }
        }
    }

    public function storeCriterion(User $user, int $competitionId, array $data): CompetitionCriterion
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can manage judging criteria.', 403);
        }

        $competition = Competition::findOrFail($competitionId);

        if ($competition->status === 'completed') {
            throw new \RuntimeException('Cannot modify criteria for a completed competition.', 422);
        }

        $data['competition_id'] = $competition->id;
        $data['sort_order'] = $data['sort_order'] ?? (int) $competition->criteria()->max('sort_order') + 1;

        return CompetitionCriterion::create($data);
    }

    public function updateCriterion(User $user, int $criterionId, array $data): CompetitionCriterion
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can manage judging criteria.', 403);
        }

        $criterion = CompetitionCriterion::findOrFail($criterionId);

        if ($criterion->competition->status === 'completed') {
            throw new \RuntimeException('Cannot modify criteria for a completed competition.', 422);
        }

        $criterion->update($data);

        return $criterion->fresh();
    }

    public function deleteCriterion(User $user, int $criterionId): bool
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can manage judging criteria.', 403);
        }

        $criterion = CompetitionCriterion::with('competition')->findOrFail($criterionId);

        if ($criterion->scores()->exists()) {
            throw new \RuntimeException('Cannot delete a criterion that has already been scored.', 422);
        }

        return (bool) $criterion->delete();
    }

    public function assignJudge(User $user, int $competitionId, string|int $userId, ?string $title = null): Competition
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can assign judges.', 403);
        }

        $competition = Competition::findOrFail($competitionId);

        $competition->judges()->syncWithoutDetaching([$userId => ['title' => $title]]);

        return $competition->fresh(['judges']);
    }

    public function removeJudge(User $user, int $competitionId, string|int $userId): Competition
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can manage judges.', 403);
        }

        $competition = Competition::findOrFail($competitionId);

        $competition->judges()->detach($userId);

        return $competition->fresh(['judges']);
    }

    public function summary(): array
    {
        return [
            'total_competitions' => (int) Competition::count(),
            'active_competitions' => (int) Competition::whereIn('status', ['registration_open', 'registration_closed', 'ongoing'])->count(),
            'completed_competitions' => (int) Competition::where('status', 'completed')->count(),
            'total_teams' => (int) \App\Models\CompetitionTeam::count(),
            'total_participants' => (int) \App\Models\CompetitionTeam::query()
                ->join('competition_team_members', 'competition_team_members.competition_team_id', '=', 'competition_teams.id')
                ->count(),
            'total_judges' => (int) \App\Models\Competition::query()
                ->join('competition_judges', 'competition_judges.competition_id', '=', 'competitions.id')
                ->distinct('competition_judges.user_id')
                ->count('competition_judges.user_id'),
            'by_status' => Competition::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->orderBy('status')
                ->get()
                ->pluck('count', 'status')
                ->toArray(),
            'by_type' => Competition::selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->orderBy('type')
                ->get()
                ->pluck('count', 'type')
                ->toArray(),
        ];
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (Competition::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . (++$i);
        }

        return $slug;
    }
}
