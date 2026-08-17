<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Resources\Library\LibraryReadingHistoryResource;
use App\Services\Library\LibraryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryHistoryController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryService $libraryService
    ) {}

    public function my(Request $request): JsonResponse
    {
        $history = $this->libraryService->myHistory(
            $request->user()?->id,
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryReadingHistoryResource::collection($history),
            'Your reading history retrieved successfully.'
        );
    }
}
