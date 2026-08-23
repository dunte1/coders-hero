<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ParentAnnouncementController extends Controller
{
    use ApiResponse;

    public function __construct(private ParentPortalService $portal) {}

    public function index(): JsonResponse
    {
        try {
            $announcements = Announcement::latest()->paginate(15);

            return $this->paginatedResponse($announcements, 'Announcements retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve announcements: ' . $e->getMessage(), 500);
        }
    }
}
