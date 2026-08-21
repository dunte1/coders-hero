<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\BulkAssignTasksRequest;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TaskService $taskService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $tasks = $this->taskService->getAll($perPage);

        return $this->paginatedResponse($tasks, 'Tasks retrieved successfully.');
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['assigned_by'] = auth()->id();

        $task = $this->taskService->create($data);

        return $this->createdResponse(
            new TaskResource($task),
            'Task created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->taskService->getById($id);

        if (!$task) {
            return $this->notFoundResponse('Task not found.');
        }

        return $this->successResponse(
            new TaskResource($task),
            'Task retrieved successfully.'
        );
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->update($id, $request->validated());

        return $this->successResponse(
            new TaskResource($task),
            'Task updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->taskService->delete($id);

        return $this->noContentResponse('Task deleted successfully.');
    }

    public function assign(Request $request, int $id): JsonResponse
    {
        $request->validate(['assigned_to' => 'required|string|exists:users,id']);

        $task = $this->taskService->assign($id, $request->assigned_to);

        return $this->successResponse(
            new TaskResource($task),
            'Task assigned successfully.'
        );
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:pending,in_progress,review,completed',
        ]);

        $task = $this->taskService->changeStatus($id, $request->status);

        return $this->successResponse(
            new TaskResource($task),
            'Task status updated successfully.'
        );
    }

    public function myTasks(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['status', 'priority', 'due_before', 'overdue']);

        $tasks = $this->taskService->getMyTasks(auth()->id(), $filters, $perPage);

        return $this->paginatedResponse($tasks, 'My tasks retrieved successfully.');
    }

    public function overdue(): JsonResponse
    {
        $tasks = $this->taskService->getOverdueTasks();

        return $this->paginatedResponse($tasks, 'Overdue tasks retrieved successfully.');
    }

    public function bulkAssign(BulkAssignTasksRequest $request): JsonResponse
    {
        $count = $this->taskService->bulkAssign($request->task_ids, $request->user_id);

        return $this->successResponse(
            ['tasks_assigned' => $count],
            "{$count} tasks assigned successfully."
        );
    }
}
