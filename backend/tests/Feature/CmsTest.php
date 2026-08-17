<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\GalleryItem;
use App\Models\Program;
use App\Models\Service;
use App\Models\SiteSection;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CmsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    private function student(): User
    {
        $user = User::factory()->create();
        $user->assignRole('student');

        return $user;
    }

    public function test_admin_endpoints_require_authentication(): void
    {
        $this->getJson('/api/admin/site/sections')->assertStatus(401);
        $this->getJson('/api/admin/services')->assertStatus(401);
        $this->getJson('/api/admin/analytics/site')->assertStatus(401);
    }

    public function test_non_admin_is_forbidden(): void
    {
        Sanctum::actingAs($this->student(), ['*']);

        $this->getJson('/api/admin/services')->assertStatus(403);
        $this->postJson('/api/admin/services', ['name' => 'X'])->assertStatus(403);
    }

    public function test_admin_can_list_all_cms_resources(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->getJson('/api/admin/site/sections')->assertOk();
        $this->getJson('/api/admin/site/settings')->assertOk();
        $this->getJson('/api/admin/services')->assertOk();
        $this->getJson('/api/admin/programs')->assertOk();
        $this->getJson('/api/admin/gallery')->assertOk();
        $this->getJson('/api/admin/testimonials')->assertOk();
        $this->getJson('/api/admin/blog')->assertOk();
        $this->getJson('/api/admin/faqs')->assertOk();
        $this->getJson('/api/admin/contact-messages')->assertOk();
        $this->getJson('/api/admin/contact-messages/stats')->assertOk();
        $this->getJson('/api/admin/chat-settings')->assertOk();
        $this->getJson('/api/admin/analytics/site')->assertOk();
    }

    public function test_admin_can_create_and_update_service(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $response = $this->postJson('/api/admin/services', [
            'name' => 'Animation Studio',
            'short_description' => 'Kids create their own animated films with Scratch.',
            'icon' => 'Clapperboard',
            'features' => ['Storyboarding', 'Animations', 'Sound design'],
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'name', 'slug']])
            ->assertJsonPath('data.slug', 'animation-studio');

        $id = $response->json('data.id');

        $this->putJson('/api/admin/services/' . $id, [
            'name' => 'Animation Studio Pro',
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'animation-studio-pro')
            ->assertJsonPath('data.is_active', false);

        $this->deleteJson('/api/admin/services/' . $id)
            ->assertOk();

        $this->assertDatabaseMissing('services', ['id' => $id]);
    }

    public function test_admin_can_create_program_with_curriculum(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->postJson('/api/admin/programs', [
            'name' => 'AI Adventures',
            'description' => 'A gentle introduction to artificial intelligence.',
            'category' => 'stem',
            'level' => 'beginner',
            'age_group' => '10 - 13 years',
            'duration_weeks' => 8,
            'sessions_per_week' => 1,
            'price' => 150.00,
            'curriculum' => [
                ['title' => 'What is AI?', 'description' => 'Explore how machines learn.', 'topics' => ['Patterns', 'Training data']],
            ],
            'outcomes' => ['Understand AI basics'],
        ])
            ->assertCreated()
            ->assertJsonPath('data.category', 'stem')
            ->assertJsonCount(1, 'data.curriculum');

        $this->assertDatabaseHas('programs', ['slug' => 'ai-adventures']);
    }

    public function test_admin_can_toggle_program_featured(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $program = Program::create([
            'name' => 'Robotics Lab',
            'slug' => 'robotics-lab',
            'description' => 'Build and program robots.',
            'category' => 'robotics',
            'is_featured' => false,
        ]);

        $this->putJson('/api/admin/programs/' . $program->id . '/toggle-featured')
            ->assertOk()
            ->assertJsonPath('data.is_featured', true);
    }

    public function test_admin_can_create_gallery_item(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->postJson('/api/admin/gallery', [
            'title' => 'Robot Parade',
            'description' => 'Our robots march across the finish line.',
            'category' => 'Robotics',
            'image' => 'https://example.com/robot.jpg',
        ])->assertCreated();

        $this->assertDatabaseHas('gallery_items', ['title' => 'Robot Parade']);
    }

    public function test_admin_can_create_and_publish_blog_post(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $response = $this->postJson('/api/admin/blog', [
            'title' => 'The Future of Coding Education',
            'content' => '<p>It is an exciting time to be learning to code.</p>',
            'excerpt' => 'A look at where coding education is heading.',
            'category' => 'Coding',
            'tags' => ['future', 'education'],
            'status' => 'draft',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft');

        $id = $response->json('data.id');

        $this->putJson('/api/admin/blog/' . $id . '/publish')
            ->assertOk()
            ->assertJsonPath('data.status', 'published');

        $this->assertNotNull(BlogPost::find($id)->published_at);

        $this->putJson('/api/admin/blog/' . $id . '/unpublish')
            ->assertOk()
            ->assertJsonPath('data.status', 'draft');
    }

    public function test_admin_can_create_and_update_faq(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $response = $this->postJson('/api/admin/faqs', [
            'question' => 'Do you run summer camps?',
            'answer' => 'Yes, we run week-long summer camps every July.',
            'category' => 'general',
        ])->assertCreated();

        $id = $response->json('data.id');

        $this->putJson('/api/admin/faqs/' . $id, ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
    }

    public function test_admin_can_create_testimonial(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->postJson('/api/admin/testimonials', [
            'name' => 'Grace W.',
            'role' => 'Parent',
            'content' => 'My daughter cannot wait for class every week!',
            'rating' => 5,
            'is_featured' => true,
        ])->assertCreated();

        $this->assertDatabaseHas('testimonials', ['name' => 'Grace W.']);
    }

    public function test_admin_can_update_site_settings(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->putJson('/api/admin/site/settings', [
            'settings' => [
                ['key' => 'general.site_name', 'value' => "Coder's Hero 2.0", 'group' => 'general'],
                ['key' => 'general.email', 'value' => 'new@codershero.com', 'group' => 'general'],
            ],
        ])->assertOk();

        $this->assertDatabaseHas('site_settings', ['key' => 'general.site_name', 'value' => "Coder's Hero 2.0"]);
        $this->assertEquals('new@codershero.com', SiteSetting::where('key', 'general.email')->value('value'));
    }

    public function test_admin_can_update_site_section(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $section = SiteSection::create([
            'section_key' => 'hero_test',
            'title' => 'Old title',
        ]);

        $this->putJson('/api/admin/site/sections/' . $section->id, ['title' => 'New title'])
            ->assertOk()
            ->assertJsonPath('data.title', 'New title');
    }

    public function test_admin_can_update_contact_message_status(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $message = \App\Models\ContactMessage::create([
            'name' => 'Parent One',
            'email' => 'p1@example.com',
            'subject' => 'Enquiry',
            'message' => 'I would like more information please.',
            'status' => 'new',
        ]);

        $this->putJson('/api/admin/contact-messages/' . $message->id . '/status', ['status' => 'replied'])
            ->assertOk()
            ->assertJsonPath('data.status', 'replied');

        $this->assertNotNull($message->fresh()->replied_at);
    }

    public function test_admin_can_update_chat_settings(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        $this->putJson('/api/admin/chat-settings', [
            'settings' => [
                'widget_title' => 'Chat with us!',
                'primary_color' => '#FF5722',
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.widget_title', 'Chat with us!');
    }

    public function test_chat_settings_report_llm_configuration_state(): void
    {
        Sanctum::actingAs($this->admin(), ['*']);

        config(['services.openai.api_key' => null]);

        $this->getJson('/api/admin/chat-settings')
            ->assertOk()
            ->assertJsonPath('data.llm_configured', false);
    }
}
