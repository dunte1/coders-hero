<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Teachers\ClassSessionService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassSessionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ClassSessionService $classSessionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sessions = $this->classSessionService->teacherIndex(
            $request->only(['class_id', 'status', 'type', 'search']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($sessions, 'Class sessions retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'meeting_url' => 'nullable|string|max:500',
            'type' => 'nullable|in:live,recorded,assignment',
            'scheduled_at' => 'nullable|date',
            'duration_minutes' => 'nullable|integer|min:1',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
        ]);

        try {
            $session = $this->classSessionService->store($request->validated());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }

        return $this->createdResponse($session->fresh(['schoolClass', 'teacher']), 'Class session created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $session = $this->classSessionService->show($id);
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        if (!$session) {
            return $this->notFoundResponse('Class session not found.');
        }

        return $this->successResponse($session, 'Class session retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'meeting_url' => 'nullable|string|max:500',
            'type' => 'sometimes|in:live,recorded,assignment',
            'scheduled_at' => 'nullable|date',
            'duration_minutes' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled',
        ]);

        try {
            $session = $this->classSessionService->update($id, $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($session, 'Class session updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->classSessionService->destroy($id);
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Class session deleted successfully.');
    }
}
