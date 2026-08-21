<?php

namespace App\Repositories\Interfaces;

use App\Models\Task;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface TaskRepositoryInterface extends BaseRepositoryInterface
{
    public function findByAssignee(string $userId, int $perPage = 15): LengthAwarePaginator;

    public function findByStatus(string $status, int $perPage = 15): LengthAwarePaginator;

    public function getOverdue(int $perPage = 15): LengthAwarePaginator;

    public function getDashboardStats(string $userId): array;

    public function getMyTasks(string $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function bulkAssign(array $taskIds, string $userId): int;
}
