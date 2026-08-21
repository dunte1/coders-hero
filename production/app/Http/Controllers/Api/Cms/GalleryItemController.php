<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryItemResource;
use App\Models\GalleryItem;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryItemController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(Request $request): JsonResponse
    {
        $query = GalleryItem::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $query->ordered();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['nullable', 'string', 'max:50'],
            'image' => ['required', 'string', 'max:4000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['image'] = $this->mediaService->store($validated['image']);

        $item = GalleryItem::create($validated);

        return $this->createdResponse(
            new GalleryItemResource($item),
            'Gallery item created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $item = GalleryItem::find($id);

        if (!$item) {
            return $this->notFoundResponse('Gallery item not found.');
        }

        return $this->successResponse(new GalleryItemResource($item), 'Gallery item retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = GalleryItem::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:4000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('image', $validated)) {
            $validated['image'] = $this->mediaService->store($validated['image']);
        }

        $item->update($validated);

        return $this->successResponse(
            new GalleryItemResource($item->fresh()),
            'Gallery item updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        GalleryItem::findOrFail($id)->delete();

        return $this->noContentResponse('Gallery item deleted successfully.');
    }
}
