<?php

namespace App\Http\Controllers\Api\Robotics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Robotics\ResolveRoboticsMaintenanceRequest;
use App\Http\Requests\Robotics\StoreRoboticsMaintenanceRequest;
use App\Http\Requests\Robotics\UpdateRoboticsMaintenanceRequest;
use App\Services\Robotics\RoboticsMaintenanceService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoboticsMaintenanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoboticsMaintenanceService $maintenanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $records = $this->maintenanceService->index($request->only(['status', 'equipment_id']), (int) $request->get('per_page', 15));

        return $this->paginatedResponse($records);
    }

    public function store(StoreRoboticsMaintenanceRequest $request): JsonResponse
    {
        $record = $this->maintenanceService->store($request->validated());

        return $this->createdResponse($record, 'Maintenance record created.');
    }

    public function update(UpdateRoboticsMaintenanceRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->maintenanceService->update($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Maintenance record not found.');
        }

        return $this->successResponse($record, 'Maintenance record updated.');
    }

    public function resolve(ResolveRoboticsMaintenanceRequest $request, int $id): JsonResponse
    {
        try {
            $record = $this->maintenanceService->resolve($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Maintenance record not found.');
        }

        return $this->successResponse($record, 'Maintenance marked as resolved.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->maintenanceService->destroy($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Maintenance record not found.');
        }

        return $this->noContentResponse('Maintenance record deleted.');
    }
}
