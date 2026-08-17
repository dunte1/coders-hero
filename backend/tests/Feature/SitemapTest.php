<?php

namespace Tests\Feature;

use Database\Seeders\RoleSeeder;
use Database\Seeders\WebsiteSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(WebsiteSeeder::class);
    }

    public function test_sitemap_xml_contains_static_and_dynamic_urls(): void
    {
        $response = $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml');

        $content = $response->getContent();

        $this->assertStringContainsString('<loc>' . url('/') . '</loc>', $content);
        $this->assertStringContainsString(url('/services'), $content);
        $this->assertStringContainsString(url('/programs'), $content);
        $this->assertStringContainsString(url('/contact'), $content);
        $this->assertStringContainsString(url('/programs/lego-robotics-foundations'), $content);
        $this->assertStringContainsString(url('/blog/scratch-vs-python-choosing-the-right-first-language'), $content);
    }

    public function test_robots_txt_mentions_sitemap(): void
    {
        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee('User-agent: *')
            ->assertSee('Sitemap: ' . url('/sitemap.xml'));
    }
}
