<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(): JsonResponse
    {
        $testimonials = Testimonial::query()->ordered()->get();

        return $this->successResponse(
            TestimonialResource::collection($testimonials),
            'Testimonials retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:4000'],
            'content' => ['required', 'string', 'max:2000'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'is_featured' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['avatar'] = $this->mediaService->store($validated['avatar'] ?? null);

        $testimonial = Testimonial::create($validated);

        return $this->createdResponse(
            new TestimonialResource($testimonial),
            'Testimonial created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return $this->notFoundResponse('Testimonial not found.');
        }

        return $this->successResponse(new TestimonialResource($testimonial), 'Testimonial retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:4000'],
            'content' => ['sometimes', 'string', 'max:2000'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'is_featured' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('avatar', $validated)) {
            $validated['avatar'] = $this->mediaService->store($validated['avatar']);
        }

        $testimonial->update($validated);

        return $this->successResponse(
            new TestimonialResource($testimonial->fresh()),
            'Testimonial updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        Testimonial::findOrFail($id)->delete();

        return $this->noContentResponse('Testimonial deleted successfully.');
    }
}
