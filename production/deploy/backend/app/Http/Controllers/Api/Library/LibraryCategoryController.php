<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\StoreLibraryCategoryRequest;
use App\Http\Requests\Library\UpdateLibraryCategoryRequest;
use App\Http\Resources\Library\LibraryCategoryResource;
use App\Services\Library\LibraryService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryCategoryController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryService $libraryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $this->libraryService->categories(
            $request->only(['search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryCategoryResource::collection($categories),
            'Categories retrieved successfully.'
        );
    }

    public function options(): JsonResponse
    {
        return $this->successResponse(
            LibraryCategoryResource::collection($this->libraryService->allCategories()),
            'Categories retrieved successfully.'
        );
    }

    public function store(StoreLibraryCategoryRequest $request): JsonResponse
    {
        $category = $this->libraryService->storeCategory($request->validated());

        return $this->createdResponse(new LibraryCategoryResource($category), 'Category created.');
    }

    public function update(UpdateLibraryCategoryRequest $request, int $id): JsonResponse
    {
        try {
            $category = $this->libraryService->updateCategory($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Category not found.');
        }

        return $this->successResponse(new LibraryCategoryResource($category), 'Category updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->libraryService->destroyCategory($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Category not found.');
        }

        return $this->noContentResponse('Category deleted.');
    }
}
