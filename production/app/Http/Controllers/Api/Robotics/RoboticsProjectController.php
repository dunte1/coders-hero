<?php

namespace App\Http\Controllers\Api\Robotics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Robotics\ReviewRoboticsSubmissionRequest;
use App\Http\Requests\Robotics\StoreRoboticsProjectRequest;
use App\Http\Requests\Robotics\SubmitRoboticsProjectRequest;
use App\Http\Requests\Robotics\UpdateRoboticsProjectRequest;
use App\Services\Robotics\RoboticsProjectService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoboticsProjectController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoboticsProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $projects = $this->projectService->index(
            auth()->user(),
            $request->only(['category', 'status', 'search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($projects);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $project = $this->projectService->show(auth()->user(), $id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Project not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($project);
    }

    public function store(StoreRoboticsProjectRequest $request): JsonResponse
    {
        try {
            $project = $this->projectService->store(auth()->user(), $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Team not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->createdResponse($project, 'Project created.');
    }

    public function update(UpdateRoboticsProjectRequest $request, int $id): JsonResponse
    {
        try {
            $project = $this->projectService->update(auth()->user(), $id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Project not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($project, 'Project updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->projectService->destroy(auth()->user(), $id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Project not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->noContentResponse('Project deleted.');
    }

    public function submissions(Request $request, int $id): JsonResponse
    {
        try {
            $project = $this->projectService->show(auth()->user(), $id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Project not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($project->submissions);
    }

    public function submit(SubmitRoboticsProjectRequest $request, int $id): JsonResponse
    {
        try {
            $submission = $this->projectService->submit(auth()->user(), $id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Project not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->createdResponse($submission, 'Project submission created.');
    }

    public function review(ReviewRoboticsSubmissionRequest $request, int $id, int $submissionId): JsonResponse
    {
        try {
            $submission = $this->projectService->review(auth()->user(), $id, $submissionId, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Project or submission not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($submission, 'Submission reviewed.');
    }
}
