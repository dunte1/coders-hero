<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['category', 'status', 'channel', 'is_read']);

        $paginator = $this->notificationService->getAll(
            auth()->id(),
            (int) $request->get('per_page', 15),
            $filters
        );

        $paginator->setCollection(
            $paginator->getCollection()->map(
                fn ($notification) => new NotificationResource($notification)
            )
        );

        return $this->paginatedResponse($paginator, 'Notifications retrieved successfully.');
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->notificationService->markAsRead(auth()->id(), $id);

        return $this->successResponse(null, 'Notification marked as read.');
    }

    public function markAllAsRead(): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead(auth()->id());

        return $this->successResponse(
            ['notifications_marked' => $count],
            "{$count} notifications marked as read."
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->notificationService->delete(auth()->id(), $id);

        return $this->noContentResponse('Notification deleted successfully.');
    }

    public function stats(): JsonResponse
    {
        $stats = $this->notificationService->getStats(auth()->id());

        return $this->successResponse($stats, 'Notification stats retrieved successfully.');
    }

    public function unread(): JsonResponse
    {
        $notifications = $this->notificationService->getUnread(auth()->id());

        return $this->successResponse(
            NotificationResource::collection($notifications),
            'Unread notifications retrieved successfully.'
        );
    }
}
