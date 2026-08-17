<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\StoreLibraryResourceRequest;
use App\Http\Requests\Library\UpdateLibraryResourceRequest;
use App\Http\Resources\Library\LibraryResourceResource;
use App\Services\Library\LibraryResourceService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryResourceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryResourceService $libraryResourceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $resources = $this->libraryResourceService->index(
            $request->only(['search', 'type', 'category_id', 'borrowed', 'mine', 'include_inactive']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryResourceResource::collection($resources),
            'Resources retrieved successfully.'
        );
    }

    public function catalog(Request $request): JsonResponse
    {
        $resources = $this->libraryResourceService->catalog(
            $request->only(['search', 'type', 'category_id']),
            (int) $request->get('per_page', 12)
        );

        return $this->paginatedResponse(
            LibraryResourceResource::collection($resources),
            'Catalog retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        try {
            $resource = $this->libraryResourceService->show($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Resource not found.');
        }

        return $this->successResponse(new LibraryResourceResource($resource));
    }

    public function store(StoreLibraryResourceRequest $request): JsonResponse
    {
        $resource = $this->libraryResourceService->store($request->validated(), $request);

        return $this->createdResponse(
            new LibraryResourceResource($resource->load(['category', 'author'])),
            'Resource added to the library.'
        );
    }

    public function update(UpdateLibraryResourceRequest $request, int $id): JsonResponse
    {
        try {
            $resource = $this->libraryResourceService->update($id, $request->validated(), $request);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Resource not found.');
        }

        return $this->successResponse(
            new LibraryResourceResource($resource->load(['category', 'author'])),
            'Resource updated.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->libraryResourceService->destroy($id);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Resource not found.');
        }

        return $this->noContentResponse('Resource deleted.');
    }
}
