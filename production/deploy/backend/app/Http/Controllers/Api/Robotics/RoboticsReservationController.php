<?php

namespace App\Http\Controllers\Api\Robotics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Robotics\StoreRoboticsReservationRequest;
use App\Services\Robotics\RoboticsReservationService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoboticsReservationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoboticsReservationService $reservationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $reservations = $this->reservationService->index(
            $request->only(['status', 'equipment_id']),
            null,
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($reservations);
    }

    public function myReservations(Request $request): JsonResponse
    {
        $reservations = $this->reservationService->index(
            $request->only(['status', 'equipment_id']),
            auth()->id(),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($reservations);
    }

    public function store(StoreRoboticsReservationRequest $request): JsonResponse
    {
        try {
            $reservation = $this->reservationService->store(auth()->id(), $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Equipment not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse($reservation, 'Reservation request submitted.');
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        try {
            $reservation = $this->reservationService->cancel($id, auth()->id());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Reservation not found.');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 403);
        }

        return $this->successResponse($reservation, 'Reservation cancelled.');
    }

    public function approve(int $id): JsonResponse
    {
        try {
            $reservation = $this->reservationService->review($id, 'approved');
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Reservation not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($reservation, 'Reservation approved.');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        try {
            $reservation = $this->reservationService->review($id, 'rejected');
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Reservation not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($reservation, 'Reservation rejected.');
    }

    public function complete(int $id): JsonResponse
    {
        try {
            $reservation = $this->reservationService->review($id, 'completed');
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Reservation not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($reservation, 'Reservation completed.');
    }
}
