<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PopupResource;
use App\Models\Popup;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicPopupController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $popups = Popup::query()
            ->active()
            ->withinDateRange()
            ->ordered()
            ->get();

        return $this->successResponse(
            PopupResource::collection($popups),
            'Popups retrieved successfully.'
        );
    }
}
