<?php

namespace Tests\Feature;

use Database\Seeders\RoleSeeder;
use Database\Seeders\WebsiteSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicWebsiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(WebsiteSeeder::class);
    }

    public function test_home_aggregate_returns_all_sections(): void
    {
        $this->getJson('/api/public/site')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'settings',
                    'sections',
                    'services',
                    'programs',
                    'testimonials',
                    'gallery',
                    'blog_posts',
                    'faqs',
                ],
            ])
            ->assertJsonCount(6, 'data.services')
            ->assertJsonCount(6, 'data.programs')
            ->assertJsonCount(6, 'data.testimonials')
            ->assertJsonCount(8, 'data.gallery')
            ->assertJsonCount(3, 'data.blog_posts')
            ->assertJsonCount(6, 'data.faqs');
    }

    public function test_home_includes_public_settings(): void
    {
        $this->getJson('/api/public/site')
            ->assertOk()
            ->assertJsonPath('data.settings.general.site_name', "Coder's Hero")
            ->assertJsonPath('data.settings.chat.enabled', '1');
    }

    public function test_services_are_publicly_listed(): void
    {
        $this->getJson('/api/public/services')
            ->assertOk()
            ->assertJsonCount(6, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'short_description', 'features']]]);
    }

    public function test_programs_can_be_filtered_by_category(): void
    {
        $response = $this->getJson('/api/public/programs?category=robotics')
            ->assertOk();

        $this->assertGreaterThan(0, count($response->json('data')));
        foreach ($response->json('data') as $program) {
            $this->assertEquals('robotics', $program['category']);
        }
    }

    public function test_program_detail_returns_curriculum(): void
    {
        $this->getJson('/api/public/programs/lego-robotics-foundations')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['id', 'name', 'slug', 'description', 'long_description', 'curriculum', 'outcomes', 'price'],
            ])
            ->assertJsonCount(3, 'data.curriculum');
    }

    public function test_unknown_program_returns_404(): void
    {
        $this->getJson('/api/public/programs/does-not-exist')->assertNotFound();
    }

    public function test_gallery_is_paginated(): void
    {
        $this->getJson('/api/public/gallery?per_page=6')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links'])
            ->assertJsonCount(6, 'data');
    }

    public function test_testimonials_are_publicly_listed(): void
    {
        $this->getJson('/api/public/testimonials')
            ->assertOk()
            ->assertJsonCount(6, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'content', 'rating']]]);
    }

    public function test_faqs_are_publicly_listed(): void
    {
        $this->getJson('/api/public/faqs')
            ->assertOk()
            ->assertJsonCount(13, 'data')
            ->assertJsonStructure(['data' => [['id', 'question', 'answer', 'category']]]);
    }

    public function test_blog_lists_published_posts_only(): void
    {
        $response = $this->getJson('/api/public/blog')->assertOk();

        $this->assertGreaterThanOrEqual(6, $response->json('meta.total'));

        foreach ($response->json('data') as $post) {
            $this->assertEquals('published', $post['status']);
        }
    }

    public function test_blog_search_and_category_filter(): void
    {
        $this->getJson('/api/public/blog?search=LEGO')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'LEGO, Motors and Magic: A Parent\'s Guide to Robotics Classes');

        $this->getJson('/api/public/blog?category=Coding')
            ->assertOk()
            ->assertJsonPath('data.0.category', 'Coding');
    }

    public function test_blog_detail_increments_views(): void
    {
        $before = \App\Models\BlogPost::where('slug', 'scratch-vs-python-choosing-the-right-first-language')->value('views');

        $this->getJson('/api/public/blog/scratch-vs-python-choosing-the-right-first-language')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'title', 'content', 'views', 'reading_minutes']]);

        $after = \App\Models\BlogPost::where('slug', 'scratch-vs-python-choosing-the-right-first-language')->value('views');

        $this->assertEquals($before + 1, $after);
    }

    public function test_blog_related_returns_posts(): void
    {
        $this->getJson('/api/public/blog/scratch-vs-python-choosing-the-right-first-language/related')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_unknown_blog_post_returns_404(): void
    {
        $this->getJson('/api/public/blog/not-a-real-post')->assertNotFound();
    }

    public function test_visitor_can_send_contact_message(): void
    {
        $this->postJson('/api/public/contact', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'subject' => 'Free trial booking',
            'message' => 'Hi, I would like to book a free trial class for my son, please.',
        ])
            ->assertCreated()
            ->assertJsonPath('message', 'Thank you! Your message has been sent. We will get back to you soon.');

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'jane@example.com',
            'status' => 'new',
        ]);
    }

    public function test_contact_message_validation_fails(): void
    {
        $this->postJson('/api/public/contact', [
            'name' => '',
            'email' => 'not-an-email',
            'subject' => '',
            'message' => 'short',
        ])->assertStatus(422);
    }

    public function test_chat_answers_from_faq_knowledge_base(): void
    {
        $response = $this->postJson('/api/public/chat', [
            'message' => 'Do you offer a free trial class?',
        ])->assertOk();

        $this->assertEquals('faq', $response->json('data.source'));
        $this->assertStringContainsStringIgnoringCase('free trial', $response->json('data.reply'));
    }

    public function test_chat_returns_helpful_fallback_for_unknown_questions(): void
    {
        $response = $this->postJson('/api/public/chat', [
            'message' => 'zxqgvbnm who owns the building',
        ])->assertOk();

        $this->assertEquals('fallback', $response->json('data.source'));
    }

    public function test_chat_requires_message(): void
    {
        $this->postJson('/api/public/chat', ['message' => ''])->assertStatus(422);
    }

    public function test_page_view_can_be_recorded(): void
    {
        $this->postJson('/api/public/analytics/page-view', [
            'path' => '/programs/lego-robotics-foundations',
            'referrer' => 'https://google.com',
            'visitor_id' => 'visitor-123',
            'is_mobile' => false,
        ])->assertCreated();

        $this->assertDatabaseHas('page_views', [
            'path' => '/programs/lego-robotics-foundations',
            'visitor_id' => 'visitor-123',
        ]);
    }
}
