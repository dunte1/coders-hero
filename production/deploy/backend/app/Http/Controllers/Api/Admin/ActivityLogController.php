<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query()
            ->with(['causer', 'subject'])
            ->latest('created_at');

        if ($request->filled('log_name')) {
            $query->where('log_name', $request->string('log_name')->value());
        }

        if ($request->filled('event')) {
            $query->where('event', $request->string('event')->value());
        }

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->string('causer_id')->value());
        }

        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->string('search')->value() . '%');
        }

        $logs = $query->paginate((int) $request->get('per_page', 25));

        return $this->paginatedResponse($logs);
    }

    public function events(): JsonResponse
    {
        $events = ActivityLog::query()
            ->whereNotNull('event')
            ->selectRaw('event, COUNT(*) as count')
            ->groupBy('event')
            ->orderByDesc('count')
            ->pluck('count', 'event');

        return $this->successResponse($events, 'Activity events retrieved successfully.');
    }
}
