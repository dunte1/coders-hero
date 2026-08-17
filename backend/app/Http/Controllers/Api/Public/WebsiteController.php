<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\ChatRequest;
use App\Http\Requests\Public\ContactRequest;
use App\Http\Requests\Public\PageViewRequest;
use App\Http\Resources\BlogPostDetailResource;
use App\Http\Resources\BlogPostResource;
use App\Http\Resources\FaqResource;
use App\Http\Resources\GalleryItemResource;
use App\Http\Resources\ProgramDetailResource;
use App\Http\Resources\ProgramResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\SiteSectionResource;
use App\Http\Resources\TestimonialResource;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Program;
use App\Models\Service;
use App\Models\SiteSection;
use App\Models\Testimonial;
use App\Services\Website\ChatService;
use App\Services\Website\WebsiteService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebsiteController extends Controller
{
    use ApiResponse;

    public function __construct(
        private WebsiteService $websiteService,
        private ChatService $chatService
    ) {}

    public function home(): JsonResponse
    {
        $data = $this->websiteService->home();

        return $this->successResponse([
            'settings' => $data['settings'],
            'sections' => SiteSectionResource::collection($data['sections']),
            'services' => ServiceResource::collection($data['services']),
            'programs' => ProgramResource::collection($data['programs']),
            'testimonials' => TestimonialResource::collection($data['testimonials']),
            'gallery' => GalleryItemResource::collection($data['gallery']),
            'blog_posts' => BlogPostResource::collection($data['blog_posts']),
            'faqs' => FaqResource::collection($data['faqs']),
        ], 'Home content retrieved successfully.');
    }

    public function services(): JsonResponse
    {
        $services = Service::query()->active()->ordered()->get();

        return $this->successResponse(
            ServiceResource::collection($services),
            'Services retrieved successfully.'
        );
    }

    public function programs(Request $request): JsonResponse
    {
        $query = Program::query()->active();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->input('search') . '%')
                    ->orWhere('description', 'like', '%' . $request->input('search') . '%');
            });
        }

        $query->ordered();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 12))->withQueryString()
        );
    }

    public function program(string $slug): JsonResponse
    {
        $program = Program::query()->active()->where('slug', $slug)->first();

        if (!$program) {
            return $this->notFoundResponse('Program not found.');
        }

        return $this->successResponse(
            new ProgramDetailResource($program),
            'Program retrieved successfully.'
        );
    }

    public function gallery(Request $request): JsonResponse
    {
        $query = GalleryItem::query()->active();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $query->ordered();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 12))->withQueryString()
        );
    }

    public function testimonials(): JsonResponse
    {
        $testimonials = Testimonial::query()->active()->ordered()->get();

        return $this->successResponse(
            TestimonialResource::collection($testimonials),
            'Testimonials retrieved successfully.'
        );
    }

    public function faqs(): JsonResponse
    {
        $faqs = Faq::query()->active()->ordered()->get();

        return $this->successResponse(
            FaqResource::collection($faqs),
            'FAQs retrieved successfully.'
        );
    }

    public function blog(Request $request): JsonResponse
    {
        $query = BlogPost::query()->published()->with('author');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $search = $request->input('search');
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('excerpt', 'like', '%' . $search . '%')
                    ->orWhere('content', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('tag')) {
            $query->whereJsonContains('tags', $request->input('tag'));
        }

        $query->ordered();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 9))->withQueryString()
        );
    }

    public function blogShow(string $slug): JsonResponse
    {
        $post = BlogPost::query()->published()->with('author')->where('slug', $slug)->first();

        if (!$post) {
            return $this->notFoundResponse('Blog post not found.');
        }

        $post->increment('views');

        return $this->successResponse(
            new BlogPostDetailResource($post->refresh()),
            'Blog post retrieved successfully.'
        );
    }

    public function blogRelated(string $slug): JsonResponse
    {
        $post = BlogPost::query()->published()->where('slug', $slug)->first();

        if (!$post) {
            return $this->notFoundResponse('Blog post not found.');
        }

        $related = BlogPost::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->when($post->category, function ($query) use ($post) {
                $query->where('category', $post->category);
            })
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        if ($related->count() < 3) {
            $excludedIds = $related->pluck('id')->push($post->id);
            $fill = BlogPost::query()
                ->published()
                ->whereNotIn('id', $excludedIds)
                ->orderByDesc('published_at')
                ->limit(3 - $related->count())
                ->get();

            $related = $related->merge($fill);
        }

        return $this->successResponse(
            BlogPostResource::collection($related),
            'Related posts retrieved successfully.'
        );
    }

    public function contact(ContactRequest $request): JsonResponse
    {
        $message = $this->websiteService->submitContact($request->validated(), $request);

        return $this->createdResponse(
            ['id' => $message->id],
            'Thank you! Your message has been sent. We will get back to you soon.'
        );
    }

    public function chat(ChatRequest $request): JsonResponse
    {
        $result = $this->chatService->chat($request->input('message'), $request->input('history', []));

        return $this->successResponse($result, 'Chat response generated.');
    }

    public function pageView(PageViewRequest $request): JsonResponse
    {
        $this->websiteService->recordPageView($request, $request->input('path'));

        return $this->createdResponse(null, 'Page view recorded.');
    }
}
