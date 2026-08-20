<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function __construct(
        private SearchService $service
    ) {}

    public function search(Request $request): JsonResponse
    {
        $query = $request->input('q', '');
        $type = $request->input('type');

        if (strlen($query) < 2) {
            return $this->errorResponse('Search query must be at least 2 characters', 422);
        }

        $results = $this->service->search($query, $type);
        return $this->successResponse($results, 'Search results');
    }
}
