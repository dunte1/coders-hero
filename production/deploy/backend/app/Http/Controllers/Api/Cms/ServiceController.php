<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(): JsonResponse
    {
        $services = Service::query()->ordered()->get();

        return $this->successResponse(
            ServiceResource::collection($services),
            'Services retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'short_description' => ['required', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:4000'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated['image'] = $this->mediaService->store($validated['image'] ?? null);

        $service = Service::create($validated);

        return $this->createdResponse(
            new ServiceResource($service),
            'Service created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return $this->notFoundResponse('Service not found.');
        }

        return $this->successResponse(new ServiceResource($service), 'Service retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'short_description' => ['sometimes', 'string', 'max:500'],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:4000'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = $this->uniqueSlug($validated['name'], $id);
        }

        if (array_key_exists('image', $validated)) {
            $validated['image'] = $this->mediaService->store($validated['image']);
        }

        $service->update($validated);

        return $this->successResponse(
            new ServiceResource($service->fresh()),
            'Service updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        Service::findOrFail($id)->delete();

        return $this->noContentResponse('Service deleted successfully.');
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'services' => ['required', 'array'],
            'services.*.id' => ['required', 'integer'],
            'services.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['services'] as $item) {
            Service::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return $this->successResponse(
            ServiceResource::collection(Service::query()->ordered()->get()),
            'Services reordered successfully.'
        );
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (DB::table('services')->where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = $base . '-' . ++$counter;
        }

        return $slug;
    }
}
