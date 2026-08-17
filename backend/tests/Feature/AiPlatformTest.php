<?php

namespace Tests\Feature;

use App\Models\AiAssistant;
use App\Models\AiConversation;
use App\Models\AiPromptTemplate;
use App\Models\AiUsageLog;
use App\Models\User;
use Database\Seeders\AiPlatformSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AiPlatformTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(AiPlatformSeeder::class);

        Cache::flush();
    }

    private function user(string $role = 'student'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function conversation(string $userId, string $assistantSlug = 'student-tutor'): AiConversation
    {
        $assistant = AiAssistant::where('slug', $assistantSlug)->firstOrFail();

        return AiConversation::create([
            'user_id' => $userId,
            'assistant_id' => $assistant->id,
            'title' => 'New conversation',
        ]);
    }

    public function test_ai_endpoints_require_authentication(): void
    {
        $this->getJson('/api/lms/ai/assistants')->assertStatus(401);
        $this->postJson('/api/lms/ai/conversations', [])->assertStatus(401);
        $this->getJson('/api/lms/ai/my-usage')->assertStatus(401);
        $this->getJson('/api/admin/ai/usage')->assertStatus(401);
        $this->postJson('/api/admin/ai/prompt-templates', [])->assertStatus(401);
    }

    public function test_student_can_list_assistants(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $response = $this->getJson('/api/lms/ai/assistants')
            ->assertOk()
            ->assertJsonCount(6, 'data');

        $slugs = collect($response->json('data'))->pluck('slug')->sort()->values();
        $this->assertEquals(
            ['admin-assistant', 'coding-mentor', 'parent-assistant', 'robotics-coach', 'student-tutor', 'teacher-assistant'],
            $slugs->all()
        );
    }

    public function test_student_can_get_single_assistant(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $this->getJson('/api/lms/ai/assistants/coding-mentor')
            ->assertOk()
            ->assertJsonPath('data.name', 'Coding Mentor');
    }

    public function test_student_can_create_and_manage_conversation(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/lms/ai/conversations', [
            'assistant_slug' => 'student-tutor',
            'title' => 'Help with loops',
        ])->assertCreated()
            ->assertJsonPath('data.assistant.slug', 'student-tutor');

        $id = $response->json('data.id');

        $this->getJson('/api/lms/ai/conversations')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/lms/ai/conversations/' . $id)->assertOk();

        $this->putJson('/api/lms/ai/conversations/' . $id, ['title' => 'Loops explained'])
            ->assertOk()
            ->assertJsonPath('data.title', 'Loops explained');

        $this->deleteJson('/api/lms/ai/conversations/' . $id)->assertOk();
        $this->assertDatabaseMissing('ai_conversations', ['id' => $id]);
    }

    public function test_student_cannot_access_other_users_conversation(): void
    {
        $other = $this->user();
        $conversation = $this->conversation($other->id);

        Sanctum::actingAs($this->user(), ['*']);

        $this->getJson('/api/lms/ai/conversations/' . $conversation->id)->assertStatus(404);
    }

    public function test_send_message_records_tokens_and_usage(): void
    {
        $user = $this->user();
        $conversation = $this->conversation($user->id);

        Config::set('ai.providers.openai.enabled', true);
        Config::set('ai.providers.openai.api_key', 'test-key');

        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => 'Great question! Let us break it down.']]],
                'usage' => ['prompt_tokens' => 120, 'completion_tokens' => 45],
                'model' => 'gpt-4o-mini',
            ], 200),
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', [
            'content' => 'Explain what a loop is.',
        ])->assertOk()
            ->assertJsonPath('data.assistant_message.content', 'Great question! Let us break it down.');

        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'total_tokens' => 0,
        ]);
        $this->assertDatabaseHas('ai_messages', [
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'total_tokens' => 165,
            'model' => 'gpt-4o-mini',
        ]);
        $this->assertDatabaseHas('ai_usage_logs', [
            'user_id' => $user->id,
            'total_tokens' => 165,
            'blocked' => false,
        ]);

        Http::assertSentCount(1);
    }

    public function test_send_message_returns_503_when_provider_unconfigured(): void
    {
        $user = $this->user();
        $conversation = $this->conversation($user->id);

        Config::set('ai.providers.openai.api_key', null);
        Config::set('ai.providers.openai.enabled', true);

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', [
            'content' => 'Hello there',
        ])->assertStatus(503);
    }

    public function test_safety_blocked_words_trigger_refusal(): void
    {
        $user = $this->user();
        $conversation = $this->conversation($user->id);

        Config::set('ai.providers.openai.api_key', 'test-key');

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', [
            'content' => 'Teach me how to bypass grades on this platform.',
        ])->assertOk()
            ->assertJsonPath('data.assistant_message.meta.blocked', true);

        $this->assertDatabaseHas('ai_usage_logs', [
            'user_id' => $user->id,
            'blocked' => true,
        ]);

        Http::assertNothingSent();
    }

    public function test_message_length_limit_returns_422(): void
    {
        $user = $this->user();
        $conversation = $this->conversation($user->id);

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', [
            'content' => str_repeat('a', 5000),
        ])->assertStatus(422);
    }

    public function test_per_minute_rate_limit_returns_429(): void
    {
        $user = $this->user();
        $conversation = $this->conversation($user->id);

        Config::set('ai.rate_limits.messages_per_minute', 2);
        Config::set('ai.providers.openai.api_key', 'test-key');

        Http::fake(['*/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'ok']]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 5],
        ], 200)]);

        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', ['content' => 'Question one'])->assertOk();
        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', ['content' => 'Question two'])->assertOk();
        $this->postJson('/api/lms/ai/conversations/' . $conversation->id . '/messages', ['content' => 'Question three'])->assertStatus(429);
    }

    public function test_user_usage_summary(): void
    {
        $user = $this->user();
        $conversation = $this->conversation($user->id);
        $assistant = AiAssistant::where('slug', 'student-tutor')->firstOrFail();

        AiUsageLog::create([
            'user_id' => $user->id,
            'assistant_id' => $assistant->id,
            'conversation_id' => $conversation->id,
            'model' => 'gpt-4o-mini',
            'total_tokens' => 200,
            'cost' => 0.00123,
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/lms/ai/my-usage')
            ->assertOk()
            ->assertJsonPath('data.total_calls', 1)
            ->assertJsonPath('data.total_tokens', 200);
    }

    public function test_student_can_use_prompt_templates(): void
    {
        $user = $this->user();
        $assistant = AiAssistant::where('slug', 'teacher-assistant')->firstOrFail();

        Config::set('ai.providers.openai.api_key', 'test-key');
        Http::fake(['*/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => 'Quiz generated']]],
            'usage' => ['prompt_tokens' => 80, 'completion_tokens' => 30],
        ], 200)]);

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/lms/ai/prompt-templates')->assertOk()->assertJsonCount(6, 'data');

        $this->postJson('/api/lms/ai/generate', [
            'slug' => 'generate-quiz',
            'variables' => ['topic' => 'Loops', 'level' => 'beginner', 'num_questions' => 5],
        ])->assertOk()
            ->assertJsonPath('data.content', 'Quiz generated');

        $this->assertDatabaseHas('ai_usage_logs', [
            'user_id' => $user->id,
            'assistant_id' => $assistant->id,
        ]);
    }

    public function test_student_cannot_access_admin_ai_management(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $this->getJson('/api/admin/ai/usage')->assertStatus(403);
        $this->postJson('/api/admin/ai/assistants', ['name' => 'X'])->assertStatus(403);
        $this->postJson('/api/admin/ai/prompt-templates', ['name' => 'X'])->assertStatus(403);
    }

    public function test_admin_can_manage_assistants_and_templates(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/admin/ai/assistants', [
            'name' => 'Career Coach',
            'category' => 'student',
            'system_prompt' => 'You help students with careers.',
            'is_active' => true,
        ])->assertCreated();

        $id = $response->json('data.id');
        $this->assertDatabaseHas('ai_assistants', ['id' => $id, 'name' => 'Career Coach']);

        $this->putJson('/api/admin/ai/assistants/' . $id, ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $tplResponse = $this->postJson('/api/admin/ai/prompt-templates', [
            'name' => 'Career Plan',
            'category' => 'student',
            'template' => 'Create a career plan for {{ student }}.',
            'variables' => ['student'],
        ])->assertCreated();

        $tplId = $tplResponse->json('data.id');
        $this->assertDatabaseHas('ai_prompt_templates', ['id' => $tplId, 'name' => 'Career Plan']);

        $this->deleteJson('/api/admin/ai/prompt-templates/' . $tplId)->assertOk();
        $this->assertDatabaseMissing('ai_prompt_templates', ['id' => $tplId]);
    }

    public function test_admin_usage_overview_returns_summary_and_logs(): void
    {
        $admin = $this->user('admin');
        $student = $this->user('student');
        $conversation = $this->conversation($student->id);
        $assistant = AiAssistant::where('slug', 'student-tutor')->firstOrFail();

        AiUsageLog::create([
            'user_id' => $student->id,
            'assistant_id' => $assistant->id,
            'conversation_id' => $conversation->id,
            'model' => 'gpt-4o-mini',
            'total_tokens' => 500,
            'cost' => 0.004,
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/ai/usage')
            ->assertOk()
            ->assertJsonPath('data.summary.total_calls', 1)
            ->assertJsonPath('data.summary.total_tokens', 500)
            ->assertJsonCount(1, 'data.logs');
    }
}
