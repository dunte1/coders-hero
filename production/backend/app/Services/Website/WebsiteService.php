<?php

namespace App\Services\Website;

use App\Models\BlogPost;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Program;
use App\Models\Service;
use App\Models\SiteSection;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use Illuminate\Http\Request;

class WebsiteService
{
    public function home(): array
    {
        $sections = SiteSection::query()
            ->active()
            ->ordered()
            ->get()
            ->keyBy('section_key');

        return [
            'settings' => $this->publicSettings(),
            'sections' => $sections,
            'services' => Service::query()->active()->ordered()->limit(6)->get(),
            'programs' => Program::query()->active()->ordered()->limit(6)->get(),
            'testimonials' => Testimonial::query()->active()->ordered()->limit(6)->get(),
            'gallery' => GalleryItem::query()->active()->ordered()->limit(8)->get(),
            'blog_posts' => BlogPost::query()->published()->ordered()->with('author')->limit(3)->get(),
            'faqs' => Faq::query()->active()->ordered()->limit(6)->get(),
        ];
    }

    public function publicSettings(): array
    {
        $settings = SiteSetting::query()->public()->get();

        $result = [];
        foreach ($settings as $setting) {
            $parts = explode('.', $setting->key, 2);
            $group = $parts[0];
            $key = $parts[1] ?? $setting->key;

            $result[$group][$key] = $setting->value;
        }

        return $result;
    }

    public function submitContact(array $data, Request $request): ContactMessage
    {
        $message = ContactMessage::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => 'new',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        \App\Jobs\NotifyAdminsNewContactMessageJob::dispatch($message);

        return $message;
    }

    public function recordPageView(Request $request, string $path): void
    {
        PageViewLogger::record($request, $path);
    }

    public function siteName(): string
    {
        return SiteSetting::where('key', 'general.site_name')->value('value') ?: 'Coder\'s Hero';
    }
}
