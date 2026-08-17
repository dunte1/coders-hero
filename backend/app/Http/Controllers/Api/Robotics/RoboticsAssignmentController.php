<?php

namespace App\Http\Controllers\Api\Robotics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Robotics\AssignRoboticsEquipmentRequest;
use App\Services\Robotics\RoboticsAssignmentService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoboticsAssignmentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoboticsAssignmentService $assignmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $assignments = $this->assignmentService->index($request->only(['status', 'equipment_id']), (int) $request->get('per_page', 15));

        return $this->paginatedResponse($assignments);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Assignment not found.');
        }

        return $this->successResponse($assignment);
    }

    public function assign(AssignRoboticsEquipmentRequest $request, int $equipmentId): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->assign($equipmentId, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Equipment not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse($assignment, 'Equipment assigned.');
    }

    public function return(int $id): JsonResponse
    {
        try {
            $assignment = $this->assignmentService->return($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Assignment not found.');
        }

        return $this->successResponse($assignment, 'Equipment returned.');
    }
}
