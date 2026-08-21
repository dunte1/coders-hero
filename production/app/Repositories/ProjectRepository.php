<?php

namespace App\Repositories;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProjectRepository extends BaseRepository implements ProjectRepositoryInterface
{
    public function __construct(Project $model)
    {
        parent::__construct($model);
    }

    public function findByOwner(string $ownerId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('owner_id', $ownerId)
            ->with(['owner', 'members.user'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findWithMembers(int $projectId): ?Project
    {
        return $this->model->with(['owner', 'members.user', 'members.project'])->find($projectId);
    }

    public function getProjectStats(): array
    {
        $allProjects = $this->model->query();

        return [
            'total' => (clone $allProjects)->count(),
            'planning' => (clone $allProjects)->byStatus('planning')->count(),
            'in_progress' => (clone $allProjects)->byStatus('in_progress')->count(),
            'on_hold' => (clone $allProjects)->byStatus('on_hold')->count(),
            'completed' => (clone $allProjects)->byStatus('completed')->count(),
            'cancelled' => (clone $allProjects)->byStatus('cancelled')->count(),
            'total_budget' => (clone $allProjects)->sum('budget') ?? 0,
            'avg_progress' => round((clone $allProjects)->avg('progress') ?? 0, 2),
        ];
    }

    public function addMember(int $projectId, string $userId, string $role): void
    {
        ProjectMember::updateOrCreate(
            ['project_id' => $projectId, 'user_id' => $userId],
            ['role' => $role, 'joined_at' => now()]
        );
    }

    public function removeMember(int $projectId, string $userId): bool
    {
        return ProjectMember::where('project_id', $projectId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function updateProgress(int $projectId, int $progress): Project
    {
        $project = $this->model->findOrFail($projectId);
        $project->update(['progress' => min(max($progress, 0), 100)]);

        if ($progress >= 100) {
            $project->update(['status' => 'completed']);
        }

        return $project->fresh();
    }
}
