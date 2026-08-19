<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\AddMemberRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectDetailResource;
use App\Http\Resources\ProjectMemberResource;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $projects = $this->projectService->getAll($perPage);

        return $this->paginatedResponse($projects, 'Projects retrieved successfully.');
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['owner_id'] = auth()->id();

        $project = $this->projectService->create($data);

        return $this->createdResponse(
            new ProjectDetailResource($project),
            'Project created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $project = $this->projectService->getById($id);

        if (!$project) {
            return $this->notFoundResponse('Project not found.');
        }

        return $this->successResponse(
            new ProjectDetailResource($project),
            'Project retrieved successfully.'
        );
    }

    public function update(UpdateProjectRequest $request, int $id): JsonResponse
    {
        $project = $this->projectService->update($id, $request->validated());

        return $this->successResponse(
            new ProjectDetailResource($project->fresh(['owner', 'members.user'])),
            'Project updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->projectService->delete($id);

        return $this->noContentResponse('Project deleted successfully.');
    }

    public function addMember(AddMemberRequest $request, int $id): JsonResponse
    {
        $this->projectService->addMember($id, $request->user_id, $request->role);

        return $this->successResponse(null, 'Member added successfully.');
    }

    public function removeMember(Request $request, int $id, string $userId): JsonResponse
    {
        $this->projectService->removeMember($id, $userId);

        return $this->noContentResponse('Member removed successfully.');
    }

    public function members(int $id): JsonResponse
    {
        $members = $this->projectService->getMembers($id);

        return $this->successResponse(
            ProjectMemberResource::collection($members),
            'Members retrieved successfully.'
        );
    }

    public function stats(): JsonResponse
    {
        $stats = $this->projectService->getProjectStats();

        return $this->successResponse($stats, 'Project stats retrieved successfully.');
    }
}
