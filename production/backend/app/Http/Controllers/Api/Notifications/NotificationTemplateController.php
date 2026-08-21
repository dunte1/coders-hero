<?php

namespace App\Http\Controllers\Api\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notifications\StoreNotificationTemplateRequest;
use App\Http\Requests\Notifications\UpdateNotificationTemplateRequest;
use App\Http\Resources\Notifications\NotificationTemplateResource;
use App\Models\NotificationTemplate;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationTemplateController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('permission:manage_notification_templates')
            ->except('index');
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = NotificationTemplate::query()
            ->withCategory($request->get('category'))
            ->when($request->boolean('active_only'), fn ($q) => $q->where('is_active', true))
            ->orderBy('category')
            ->orderBy('event')
            ->paginate((int) $request->get('per_page', 15));

        $paginator->setCollection(
            $paginator->getCollection()->map(
                fn ($template) => new NotificationTemplateResource($template)
            )
        );

        return $this->paginatedResponse($paginator, 'Notification templates retrieved successfully.');
    }

    public function store(StoreNotificationTemplateRequest $request): JsonResponse
    {
        $template = NotificationTemplate::create($request->validated());

        return $this->createdResponse(
            new NotificationTemplateResource($template),
            'Notification template created successfully.'
        );
    }

    public function show(NotificationTemplate $notificationTemplate): JsonResponse
    {
        return $this->successResponse(
            new NotificationTemplateResource($notificationTemplate),
            'Notification template retrieved successfully.'
        );
    }

    public function update(UpdateNotificationTemplateRequest $request, NotificationTemplate $notificationTemplate): JsonResponse
    {
        $notificationTemplate->update($request->validated());

        return $this->successResponse(
            new NotificationTemplateResource($notificationTemplate->fresh()),
            'Notification template updated successfully.'
        );
    }

    public function destroy(NotificationTemplate $notificationTemplate): JsonResponse
    {
        $notificationTemplate->delete();

        return $this->noContentResponse('Notification template deleted successfully.');
    }
}
