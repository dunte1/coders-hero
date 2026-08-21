<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Website\SitemapService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __construct(private SitemapService $sitemapService) {}

    public function sitemap(): Response
    {
        $urls = $this->sitemapService->urls();

        $xml = $this->buildXml($urls);

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            '',
            'Sitemap: ' . url('/sitemap.xml'),
        ]);

        return response($content, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    private function buildXml(array $urls): string
    {
        $urlset = '';
        foreach ($urls as $url) {
            $urlset .= '  <url>' . "\n";
            $urlset .= '    <loc>' . e($url['loc']) . '</loc>' . "\n";
            if (isset($url['lastmod'])) {
                $urlset .= '    <lastmod>' . e($url['lastmod']) . '</lastmod>' . "\n";
            }
            if (isset($url['changefreq'])) {
                $urlset .= '    <changefreq>' . e($url['changefreq']) . '</changefreq>' . "\n";
            }
            $urlset .= '    <priority>' . e($url['priority']) . '</priority>' . "\n";
            $urlset .= '  </url>' . "\n";
        }

        return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
            . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n"
            . $urlset
            . '</urlset>';
    }
}
