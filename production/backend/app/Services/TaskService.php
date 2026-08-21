<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\Interfaces\TaskRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskService
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository
    ) {}

    public function getAll(int $perPage = 15)
    {
        return $this->taskRepository->paginate($perPage, ['*'], ['assigner', 'assignee']);
    }

    public function getById(int $id): ?Task
    {
        return $this->taskRepository->findById($id, ['*'], ['assigner', 'assignee']);
    }

    public function create(array $data): Task
    {
        $task = $this->taskRepository->create($data);
        return $task->load(['assigner', 'assignee']);
    }

    public function update(int $id, array $data): Task
    {
        if (isset($data['status']) && $data['status'] === 'completed') {
            $data['completed_at'] = now();
        }

        return $this->taskRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->taskRepository->delete($id);
    }

    public function assign(int $taskId, string $userId): Task
    {
        return $this->taskRepository->update($taskId, ['assigned_to' => $userId]);
    }

    public function changeStatus(int $taskId, string $status): Task
    {
        $data = ['status' => $status];
        if ($status === 'completed') {
            $data['completed_at'] = now();
        }
        return $this->taskRepository->update($taskId, $data);
    }

    public function getMyTasks(string $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->getMyTasks($userId, $filters, $perPage);
    }

    public function getOverdueTasks(int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->getOverdue($perPage);
    }

    public function getDashboardStats(string $userId): array
    {
        return $this->taskRepository->getDashboardStats($userId);
    }

    public function bulkAssign(array $taskIds, string $userId): int
    {
        return $this->taskRepository->bulkAssign($taskIds, $userId);
    }
}
