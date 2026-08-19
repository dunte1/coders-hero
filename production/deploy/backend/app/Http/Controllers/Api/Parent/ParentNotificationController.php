<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentNotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Notification::forUser(auth()->id());

        if ($request->get('filter') === 'unread') {
            $query->unread();
        }

        $notifications = $query->orderByDesc('created_at')->paginate((int) $request->get('per_page', 20));

        return $this->paginatedResponse($notifications, 'Notifications retrieved successfully.');
    }

    public function markRead(string $id): JsonResponse
    {
        $notification = Notification::forUser(auth()->id())->find($id);

        if (!$notification) {
            return $this->notFoundResponse('Notification not found.');
        }

        $notification->markAsRead();

        return $this->successResponse($notification, 'Notification marked as read.');
    }

    public function markAllRead(): JsonResponse
    {
        Notification::forUser(auth()->id())->unread()->update(['read_at' => now()]);

        return $this->successResponse(null, 'All notifications marked as read.');
    }
}
