<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\ReserveLibraryResourceRequest;
use App\Http\Resources\Library\LibraryReservationResource;
use App\Services\Library\LibraryService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryReservationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryService $libraryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $reservations = $this->libraryService->allReservations(
            $request->only(['status']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryReservationResource::collection($reservations),
            'Reservations retrieved successfully.'
        );
    }

    public function my(Request $request): JsonResponse
    {
        $reservations = $this->libraryService->myReservations(
            $request->user()?->id,
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryReservationResource::collection($reservations),
            'Your reservations retrieved successfully.'
        );
    }

    public function store(ReserveLibraryResourceRequest $request, int $id): JsonResponse
    {
        try {
            $reservation = $this->libraryService->reserve($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Resource not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse(
            new LibraryReservationResource($reservation->load(['resource', 'user'])),
            'Reservation created.'
        );
    }

    public function cancel(int $reservationId): JsonResponse
    {
        try {
            $reservation = $this->libraryService->cancelReservation($reservationId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Reservation not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        }

        return $this->successResponse(
            new LibraryReservationResource($reservation->load(['resource', 'user'])),
            'Reservation cancelled.'
        );
    }
}
