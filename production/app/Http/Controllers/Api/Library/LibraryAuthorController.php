<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\StoreLibraryAuthorRequest;
use App\Http\Requests\Library\UpdateLibraryAuthorRequest;
use App\Http\Resources\Library\LibraryAuthorResource;
use App\Services\Library\LibraryService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryAuthorController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryService $libraryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $authors = $this->libraryService->authors(
            $request->only(['search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryAuthorResource::collection($authors),
            'Authors retrieved successfully.'
        );
    }

    public function options(): JsonResponse
    {
        return $this->successResponse(
            LibraryAuthorResource::collection($this->libraryService->allAuthors()),
            'Authors retrieved successfully.'
        );
    }

    public function store(StoreLibraryAuthorRequest $request): JsonResponse
    {
        $author = $this->libraryService->storeAuthor($request->validated());

        return $this->createdResponse(new LibraryAuthorResource($author), 'Author created.');
    }

    public function update(UpdateLibraryAuthorRequest $request, int $id): JsonResponse
    {
        try {
            $author = $this->libraryService->updateAuthor($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Author not found.');
        }

        return $this->successResponse(new LibraryAuthorResource($author), 'Author updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->libraryService->destroyAuthor($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Author not found.');
        }

        return $this->noContentResponse('Author deleted.');
    }
}
