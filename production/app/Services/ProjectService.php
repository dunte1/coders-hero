<?php

namespace App\Services;

use App\Models\Project;
use App\Repositories\Interfaces\ProjectRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProjectService
{
    public function __construct(
        private ProjectRepositoryInterface $projectRepository
    ) {}

    public function getAll(int $perPage = 15)
    {
        return $this->projectRepository->paginate($perPage, ['*'], ['owner', 'members.user']);
    }

    public function getById(int $id): ?Project
    {
        return $this->projectRepository->findWithMembers($id);
    }

    public function create(array $data): Project
    {
        $data['slug'] = \Str::slug($data['name']);
        $project = $this->projectRepository->create($data);

        $this->addMember($project->id, $data['owner_id'], 'lead');

        return $project->fresh(['owner', 'members.user']);
    }

    public function update(int $id, array $data): Project
    {
        if (isset($data['name'])) {
            $data['slug'] = \Str::slug($data['name']);
        }

        return $this->projectRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->projectRepository->delete($id);
    }

    public function addMember(int $projectId, string $userId, string $role): void
    {
        $this->projectRepository->addMember($projectId, $userId, $role);
    }

    public function removeMember(int $projectId, string $userId): bool
    {
        return $this->projectRepository->removeMember($projectId, $userId);
    }

    public function getMembers(int $projectId)
    {
        $project = $this->projectRepository->findWithMembers($projectId);
        return $project ? $project->members()->with('user')->get() : collect();
    }

    public function updateProgress(int $projectId, int $progress): Project
    {
        return $this->projectRepository->updateProgress($projectId, $progress);
    }

    public function getProjectStats(): array
    {
        return $this->projectRepository->getProjectStats();
    }

    public function findByOwner(string $ownerId, int $perPage = 15)
    {
        return $this->projectRepository->findByOwner($ownerId, $perPage);
    }
}
