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
use App\Models\CalendarEvent;
use App\Models\Course;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\PartnerSchool;
use App\Models\Program;
use App\Models\Service;
use App\Models\SiteSection;
use App\Models\Testimonial;
use App\Services\Students\AdmissionService;
use App\Services\Website\ChatService;
use App\Services\Website\WebsiteService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WebsiteController extends Controller
{
    use ApiResponse;

    public function __construct(
        private WebsiteService $websiteService,
        private ChatService $chatService,
        private AdmissionService $admissionService
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

    public function courses(Request $request): JsonResponse
    {
        $query = Course::published()
            ->with(['category', 'instructor'])
            ->orderBy('title');

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $courses = $query->take((int) $request->get('per_page', 12))
            ->get(['id', 'title', 'slug', 'description', 'thumbnail', 'category_id', 'instructor_id', 'level', 'duration_hours', 'price']);

        return $this->successResponse($courses, 'Courses retrieved successfully.');
    }

    public function events(Request $request): JsonResponse
    {
        $query = CalendarEvent::query()
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at');

        if ($request->filled('type')) {
            $query->where('event_type', $request->type);
        }

        $events = $query->take((int) $request->get('per_page', 12))
            ->get(['id', 'title', 'description', 'event_type', 'starts_at', 'ends_at', 'all_day', 'location', 'color']);

        return $this->successResponse($events, 'Events retrieved successfully.');
    }

    public function submitAdmission(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'grade' => 'required|string|max:50',
            'parent_name' => 'required|string|max:255',
            'parent_phone' => 'required|string|max:20',
            'parent_email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->validationErrorResponse($validator->errors(), 'Validation failed.');
        }

        $data = $validator->validated();

        $admission = $this->admissionService->create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'date_of_birth' => $data['date_of_birth'],
            'gender' => $data['gender'],
            'grade' => $data['grade'],
            'guardian_name' => $data['parent_name'],
            'guardian_phone' => $data['parent_phone'],
            'guardian_email' => $data['parent_email'] ?? null,
            'address' => $data['address'] ?? null,
            'notes' => $data['notes'] ?? null,
            'source' => 'online',
            'status' => 'new',
        ]);

        \App\Jobs\SendAdmissionConfirmationJob::dispatch($admission);

        \App\Jobs\NotifyAdminsNewApplicationJob::dispatch($admission);

        return $this->createdResponse(
            ['id' => $admission->id, 'application_number' => $admission->application_number],
            'Your application has been submitted successfully. We will review it and contact you soon.'
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

    public function partnerSchools(): JsonResponse
    {
        $schools = PartnerSchool::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'contact_person', 'city', 'country', 'partnership_type', 'notes']);

        return $this->successResponse($schools, 'Partner schools retrieved successfully.');
    }
}
