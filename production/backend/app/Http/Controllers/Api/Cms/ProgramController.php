<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProgramDetailResource;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProgramController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Program::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        $query->ordered();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
            'long_description' => ['nullable', 'string'],
            'category' => ['required', 'in:coding,robotics,stem'],
            'level' => ['nullable', 'string', 'max:50'],
            'age_group' => ['nullable', 'string', 'max:50'],
            'duration_weeks' => ['nullable', 'integer', 'min:1'],
            'sessions_per_week' => ['nullable', 'integer', 'min:1'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'price_suffix' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:4000'],
            'curriculum' => ['nullable', 'array'],
            'outcomes' => ['nullable', 'array'],
            'outcomes.*' => ['string', 'max:500'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'meta' => ['nullable', 'array'],
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated['image'] = $this->mediaService->store($validated['image'] ?? null);

        $program = Program::create($validated);

        return $this->createdResponse(
            new ProgramDetailResource($program),
            'Program created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $program = Program::find($id);

        if (!$program) {
            return $this->notFoundResponse('Program not found.');
        }

        return $this->successResponse(new ProgramDetailResource($program), 'Program retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $program = Program::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:1000'],
            'long_description' => ['nullable', 'string'],
            'category' => ['sometimes', 'in:coding,robotics,stem'],
            'level' => ['nullable', 'string', 'max:50'],
            'age_group' => ['nullable', 'string', 'max:50'],
            'duration_weeks' => ['nullable', 'integer', 'min:1'],
            'sessions_per_week' => ['nullable', 'integer', 'min:1'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'price_suffix' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:4000'],
            'curriculum' => ['nullable', 'array'],
            'outcomes' => ['nullable', 'array'],
            'outcomes.*' => ['string', 'max:500'],
            'is_featured' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'meta' => ['nullable', 'array'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = $this->uniqueSlug($validated['name'], $id);
        }

        if (array_key_exists('image', $validated)) {
            $validated['image'] = $this->mediaService->store($validated['image']);
        }

        $program->update($validated);

        return $this->successResponse(
            new ProgramDetailResource($program->fresh()),
            'Program updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        Program::findOrFail($id)->delete();

        return $this->noContentResponse('Program deleted successfully.');
    }

    public function toggleFeatured(int $id): JsonResponse
    {
        $program = Program::findOrFail($id);
        $program->update(['is_featured' => !$program->is_featured]);

        return $this->successResponse(
            new ProgramResource($program->fresh()),
            'Program featured status updated.'
        );
    }

    public function toggleActive(int $id): JsonResponse
    {
        $program = Program::findOrFail($id);
        $program->update(['is_active' => !$program->is_active]);

        return $this->successResponse(
            new ProgramResource($program->fresh()),
            'Program status updated.'
        );
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (DB::table('programs')->where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = $base . '-' . ++$counter;
        }

        return $slug;
    }
}
