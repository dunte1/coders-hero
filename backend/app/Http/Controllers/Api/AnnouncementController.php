<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Services\AnnouncementService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AnnouncementService $announcementService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $user = $request->user();

        if ($user->hasAnyRole(['admin', 'super_admin'])) {
            $announcements = $this->announcementService->getAllForAdmin($perPage);
        } else {
            $announcements = $this->announcementService->forUser($user->id);
        }

        return $this->paginatedResponse($announcements, 'Announcements retrieved successfully.');
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['author_id'] = auth()->id();

        $announcement = $this->announcementService->create($data);

        return $this->createdResponse(
            new AnnouncementResource($announcement),
            'Announcement created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $announcement = $this->announcementService->getById($id);

        if (!$announcement) {
            return $this->notFoundResponse('Announcement not found.');
        }

        return $this->successResponse(
            new AnnouncementResource($announcement),
            'Announcement retrieved successfully.'
        );
    }

    public function update(UpdateAnnouncementRequest $request, int $id): JsonResponse
    {
        $announcement = $this->announcementService->update($id, $request->validated());

        return $this->successResponse(
            new AnnouncementResource($announcement),
            'Announcement updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $this->announcementService->delete($id);

        return $this->noContentResponse('Announcement deleted successfully.');
    }

    public function pin(int $id): JsonResponse
    {
        $announcement = $this->announcementService->pin($id);

        return $this->successResponse(
            new AnnouncementResource($announcement),
            'Announcement pin status toggled.'
        );
    }
}
