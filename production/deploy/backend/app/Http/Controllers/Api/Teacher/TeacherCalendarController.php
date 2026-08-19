<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreCalendarEventRequest;
use App\Http\Requests\Teacher\UpdateCalendarEventRequest;
use App\Services\Teachers\CalendarService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherCalendarController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CalendarService $calendarService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $events = $this->calendarService->events(
            auth()->id(),
            $request->only(['from', 'to', 'class_id', 'event_type'])
        );

        return $this->successResponse($events, 'Calendar events retrieved successfully.');
    }

    public function store(StoreCalendarEventRequest $request): JsonResponse
    {
        $event = $this->calendarService->create(auth()->id(), $request->validated());

        return $this->createdResponse($event, 'Event created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $event = $this->calendarService->getById($id, auth()->id());

        if (!$event) {
            return $this->notFoundResponse('Event not found.');
        }

        return $this->successResponse($event, 'Event retrieved successfully.');
    }

    public function update(UpdateCalendarEventRequest $request, int $id): JsonResponse
    {
        try {
            $event = $this->calendarService->update($id, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($event, 'Event updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->calendarService->delete($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Event deleted successfully.');
    }
}
