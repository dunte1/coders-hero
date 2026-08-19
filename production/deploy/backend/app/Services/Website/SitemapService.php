<?php

namespace App\Services\Website;

use App\Models\BlogPost;
use App\Models\Program;

class SitemapService
{
    public function urls(): array
    {
        $base = url('/');
        $today = now()->toDateString();

        $urls = [
            ['loc' => $base, 'changefreq' => 'weekly', 'priority' => '1.0'],
            ['loc' => $base . '/services', 'changefreq' => 'weekly', 'priority' => '0.9'],
            ['loc' => $base . '/programs', 'changefreq' => 'weekly', 'priority' => '0.9'],
            ['loc' => $base . '/robotics', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => $base . '/coding', 'changefreq' => 'weekly', 'priority' => '0.8'],
            ['loc' => $base . '/gallery', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => $base . '/testimonials', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => $base . '/blog', 'changefreq' => 'daily', 'priority' => '0.8'],
            ['loc' => $base . '/faq', 'changefreq' => 'monthly', 'priority' => '0.6'],
            ['loc' => $base . '/contact', 'changefreq' => 'monthly', 'priority' => '0.7'],
        ];

        foreach (Program::query()->active()->get() as $program) {
            $urls[] = [
                'loc' => $base . '/programs/' . $program->slug,
                'changefreq' => 'monthly',
                'priority' => '0.8',
            ];
        }

        foreach (BlogPost::query()->published()->get() as $post) {
            $urls[] = [
                'loc' => $base . '/blog/' . $post->slug,
                'changefreq' => 'monthly',
                'priority' => '0.7',
                'lastmod' => $post->updated_at?->toDateString() ?? $today,
            ];
        }

        return $urls;
    }
}
