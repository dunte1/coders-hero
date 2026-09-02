<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostDetailResource;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;
use App\Services\Website\MediaService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    use ApiResponse;

    public function __construct(private MediaService $mediaService) {}

    public function index(Request $request): JsonResponse
    {
        $query = BlogPost::query()->with('author');

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->input('search') . '%');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $query->orderByDesc('created_at');

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['cover_image'] = $this->mediaService->store($validated['cover_image'] ?? null);
        $validated['author_id'] = $request->user()->id;

        if ($validated['status'] === 'published') {
            $validated['published_at'] = $validated['published_at'] ?? now();
        }

        $post = BlogPost::create($validated);

        return $this->createdResponse(
            new BlogPostDetailResource($post->load('author')),
            'Blog post created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $post = BlogPost::with('author')->find($id);

        if (!$post) {
            return $this->notFoundResponse('Blog post not found.');
        }

        return $this->successResponse(new BlogPostDetailResource($post), 'Blog post retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate($this->rules($id));

        if (isset($validated['title'])) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $id);
        }

        if (array_key_exists('cover_image', $validated)) {
            $validated['cover_image'] = $this->mediaService->store($validated['cover_image']);
        }

        if (($validated['status'] ?? $post->status) === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return $this->successResponse(
            new BlogPostDetailResource($post->fresh()->load('author')),
            'Blog post updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        BlogPost::findOrFail($id)->delete();

        return $this->noContentResponse('Blog post deleted successfully.');
    }

    public function publish(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update([
            'status' => 'published',
            'published_at' => $post->published_at ?? now(),
        ]);

        return $this->successResponse(
            new BlogPostResource($post->fresh()->load('author')),
            'Blog post published successfully.'
        );
    }

    public function unpublish(int $id): JsonResponse
    {
        $post = BlogPost::findOrFail($id);
        $post->update(['status' => 'draft']);

        return $this->successResponse(
            new BlogPostResource($post->fresh()->load('author')),
            'Blog post moved to draft.'
        );
    }

    private function rules(?int $ignoreId = null): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_image' => ['nullable', 'string', 'max:7000000'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['required', 'in:draft,published,archived'],
            'is_featured' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta' => ['nullable', 'array'],
        ];
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $counter = 1;

        while (DB::table('blog_posts')->where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = $base . '-' . ++$counter;
        }

        return $slug;
    }
}
