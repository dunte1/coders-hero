<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\ToggleBookmarkRequest;
use App\Services\Lms\BookmarkService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    use ApiResponse;

    public function __construct(
        private BookmarkService $bookmarkService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $bookmarks = $this->bookmarkService->all(
            auth()->id(),
            $request->get('type'),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($bookmarks, 'Bookmarks retrieved successfully.');
    }

    public function toggle(ToggleBookmarkRequest $request): JsonResponse
    {
        try {
            $result = $this->bookmarkService->toggle(
                auth()->id(),
                $request->validated('type'),
                $request->validated('bookmarkable_id')
            );
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->successResponse($result, $result['bookmarked'] ? 'Added to bookmarks.' : 'Removed from bookmarks.');
    }

    public function status(Request $request): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'in:course,lesson,thread'],
            'bookmarkable_id' => ['required', 'integer'],
        ]);

        return $this->successResponse(
            $this->bookmarkService->status(auth()->id(), $request->get('type'), (int) $request->get('bookmarkable_id')),
            'Bookmark status retrieved successfully.'
        );
    }
}
