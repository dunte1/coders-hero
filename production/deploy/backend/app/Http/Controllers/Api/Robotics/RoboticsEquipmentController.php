<?php

namespace App\Http\Controllers\Api\Robotics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Robotics\StoreRoboticsEquipmentRequest;
use App\Http\Requests\Robotics\UpdateRoboticsEquipmentRequest;
use App\Services\Robotics\RoboticsEquipmentService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoboticsEquipmentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoboticsEquipmentService $equipmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $equipment = $this->equipmentService->index($request->only(['type', 'status', 'search']), (int) $request->get('per_page', 15));

        return $this->paginatedResponse($equipment);
    }

    public function show(int $id): JsonResponse
    {
        try {
            $equipment = $this->equipmentService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Equipment not found.');
        }

        return $this->successResponse($equipment);
    }

    public function store(StoreRoboticsEquipmentRequest $request): JsonResponse
    {
        $equipment = $this->equipmentService->store($request->validated());

        return $this->createdResponse($equipment, 'Equipment added to inventory.');
    }

    public function update(UpdateRoboticsEquipmentRequest $request, int $id): JsonResponse
    {
        try {
            $equipment = $this->equipmentService->update($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Equipment not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($equipment, 'Equipment updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->equipmentService->destroy($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Equipment not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->noContentResponse('Equipment removed.');
    }

    public function scan(string $qrCode): JsonResponse
    {
        try {
            $equipment = $this->equipmentService->scan($qrCode);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('No equipment found for that QR code.');
        }

        $data = $equipment->toArray();
        $data['qr_code_url'] = $this->equipmentService->generateQrDataUrl($equipment->qr_code);

        return $this->successResponse($data);
    }

    public function qrCode(int $id): JsonResponse
    {
        try {
            $equipment = $this->equipmentService->regenerateQr($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Equipment not found.');
        }

        return $this->successResponse([
            'id' => $equipment->id,
            'name' => $equipment->name,
            'qr_code' => $equipment->qr_code,
            'qr_code_url' => $this->equipmentService->generateQrDataUrl($equipment->qr_code),
        ], 'QR code regenerated.');
    }

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->equipmentService->summary());
    }
}
