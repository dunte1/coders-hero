<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteSectionResource;
use App\Models\SiteSection;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSectionController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(): JsonResponse
    {
        $sections = SiteSection::query()->ordered()->get();

        return $this->successResponse(
            SiteSectionResource::collection($sections),
            'Site sections retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'section_key' => ['required', 'string', 'max:100', 'unique:site_sections,section_key'],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:4000'],
            'badge' => ['nullable', 'string', 'max:255'],
            'button_label' => ['nullable', 'string', 'max:255'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['image'] = $this->mediaService->store($validated['image'] ?? null);

        $section = SiteSection::create($validated);

        return $this->createdResponse(
            new SiteSectionResource($section),
            'Site section created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $section = SiteSection::find($id);

        if (!$section) {
            return $this->notFoundResponse('Site section not found.');
        }

        return $this->successResponse(new SiteSectionResource($section), 'Site section retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $section = SiteSection::findOrFail($id);

        $validated = $request->validate([
            'section_key' => ['sometimes', 'string', 'max:100', 'unique:site_sections,section_key,' . $id],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:4000'],
            'badge' => ['nullable', 'string', 'max:255'],
            'button_label' => ['nullable', 'string', 'max:255'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'meta' => ['nullable', 'array'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('image', $validated)) {
            $validated['image'] = $this->mediaService->store($validated['image']);
        }

        $section->update($validated);

        return $this->successResponse(
            new SiteSectionResource($section->fresh()),
            'Site section updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        SiteSection::findOrFail($id)->delete();

        return $this->noContentResponse('Site section deleted successfully.');
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.id' => ['required', 'integer'],
            'sections.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['sections'] as $item) {
            SiteSection::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->successResponse(
            SiteSectionResource::collection(SiteSection::query()->ordered()->get()),
            'Site sections reordered successfully.'
        );
    }
}
