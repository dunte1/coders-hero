<?php

namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Interfaces\TaskRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TaskRepository extends BaseRepository implements TaskRepositoryInterface
{
    public function __construct(Task $model)
    {
        parent::__construct($model);
    }

    public function findByAssignee(string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->assignedTo($userId)
            ->with(['assigner', 'assignee'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findByStatus(string $status, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->byStatus($status)
            ->with(['assigner', 'assignee'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getOverdue(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->overdue()
            ->with(['assigner', 'assignee'])
            ->orderBy('due_date')
            ->paginate($perPage);
    }

    public function getDashboardStats(string $userId): array
    {
        $tasks = $this->model->where('assigned_to', $userId);

        return [
            'total' => (clone $tasks)->count(),
            'pending' => (clone $tasks)->byStatus('pending')->count(),
            'in_progress' => (clone $tasks)->byStatus('in_progress')->count(),
            'review' => (clone $tasks)->byStatus('review')->count(),
            'completed' => (clone $tasks)->byStatus('completed')->count(),
            'overdue' => (clone $tasks)->overdue()->count(),
            'due_today' => (clone $tasks)->where('due_date', today())->count(),
            'due_this_week' => (clone $tasks)->whereBetween('due_date', [now(), now()->endOfWeek()])->count(),
        ];
    }

    public function getMyTasks(string $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->assignedTo($userId)->with(['assigner']);

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->byPriority($filters['priority']);
        }

        if (!empty($filters['due_before'])) {
            $query->where('due_date', '<=', $filters['due_before']);
        }

        if (!empty($filters['overdue'])) {
            $query->overdue();
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function bulkAssign(array $taskIds, string $userId): int
    {
        return $this->model->whereIn('id', $taskIds)
            ->update(['assigned_to' => $userId]);
    }
}
