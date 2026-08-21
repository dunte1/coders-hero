<?php

namespace App\Http\Controllers\Api\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notifications\SendNotificationRequest;
use App\Http\Resources\Notifications\NotificationDeliveryResource;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Jobs\SendChannelNotificationJob;
use App\Models\User;
use App\Services\Notifications\NotificationDispatcher;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationAdminController extends Controller
{
    use ApiResponse;

    public function __construct(
        private NotificationDispatcher $dispatcher
    ) {
        $this->middleware('permission:view_notification_deliveries')
            ->only(['summary', 'deliveries']);
        $this->middleware('permission:broadcast_notifications')
            ->only(['send']);
    }

    public function summary(): JsonResponse
    {
        $total = Notification::count();
        $delivered = NotificationDelivery::where('status', 'delivered')->count();
        $failed = NotificationDelivery::where('status', 'failed')->count();
        $queued = NotificationDelivery::where('status', 'queued')->count();
        $sending = NotificationDelivery::where('status', 'sending')->count();

        $byCategory = Notification::query()
            ->selectRaw('category, count(*) as total')
            ->whereNotNull('category')
            ->groupBy('category')
            ->pluck('total', 'category');

        $lastWeek = Notification::where('created_at', '>=', now()->subDays(7))->count();
        $templatesActive = \App\Models\NotificationTemplate::where('is_active', true)->count();
        $registeredDevices = \App\Models\UserFcmToken::whereNull('revoked_at')->count();

        return $this->successResponse([
            'notifications_total' => $total,
            'notifications_last_week' => $lastWeek,
            'deliveries' => [
                'queued' => $queued,
                'sending' => $sending,
                'delivered' => $delivered,
                'failed' => $failed,
            ],
            'delivery_rate' => $total > 0 ? round(($delivered / max(1, $delivered + $failed)) * 100, 2) : 0,
            'by_category' => $byCategory,
            'active_templates' => $templatesActive,
            'registered_devices' => $registeredDevices,
        ], 'Notification summary retrieved successfully.');
    }

    public function deliveries(Request $request): JsonResponse
    {
        $paginator = NotificationDelivery::query()
            ->with(['notification.notifiable'])
            ->ofStatus($request->get('status'))
            ->ofChannel($request->get('channel'))
            ->when($request->has('category'), function ($q) use ($request) {
                $q->whereHas('notification', fn ($nq) => $nq->where('category', $request->get('category')));
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%' . $request->get('search') . '%';
                $q->whereHas('notification.notifiable', function ($uq) use ($term) {
                    $uq->where('name', 'like', $term)->orWhere('email', 'like', $term);
                });
            })
            ->orderByDesc('created_at')
            ->paginate((int) $request->get('per_page', 15));

        $paginator->setCollection(
            $paginator->getCollection()->map(
                fn ($delivery) => new NotificationDeliveryResource($delivery)
            )
        );

        return $this->paginatedResponse($paginator, 'Notification deliveries retrieved successfully.');
    }

    public function send(SendNotificationRequest $request): JsonResponse
    {
        $event = $request->input('event');
        $data = $request->input('data', []);
        $link = $request->input('link');
        $channels = $request->input('channels');

        if ($request->input('recipient_type') === 'role') {
            $sent = $this->dispatcher->notifyRole(
                $request->input('role'),
                $event,
                $data,
                $link,
                $channels
            );
        } else {
            $users = User::whereIn('id', $request->input('recipient_ids', []))->get();
            $sent = $this->dispatcher->notify($users, $event, $data, $link, $channels);
        }

        return $this->successResponse(
            ['notifications_created' => count($sent)],
            'Notification sent successfully.'
        );
    }

    public function retryDelivery(int $id): JsonResponse
    {
        $delivery = NotificationDelivery::findOrFail($id);

        if ($delivery->status === 'delivered') {
            return $this->successResponse(
                new NotificationDeliveryResource($delivery),
                'Delivery already completed.'
            );
        }

        $delivery->update([
            'status' => 'queued',
            'error_message' => null,
            'retry_count' => 0,
            'last_retried_at' => null,
        ]);

        SendChannelNotificationJob::dispatch($delivery->id)->onQueue('notifications');

        return $this->successResponse(
            new NotificationDeliveryResource($delivery->fresh()),
            'Delivery re-queued successfully.'
        );
    }
}
