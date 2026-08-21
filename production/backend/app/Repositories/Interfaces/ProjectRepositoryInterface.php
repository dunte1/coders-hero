<?php

namespace App\Repositories\Interfaces;

use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProjectRepositoryInterface extends BaseRepositoryInterface
{
    public function findByOwner(string $ownerId, int $perPage = 15): LengthAwarePaginator;

    public function findWithMembers(int $projectId): ?Project;

    public function getProjectStats(): array;

    public function addMember(int $projectId, string $userId, string $role): void;

    public function removeMember(int $projectId, string $userId): bool;

    public function updateProgress(int $projectId, int $progress): Project;
}
