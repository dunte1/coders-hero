<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\CodingExercise;
use App\Models\CodingSubmission;
use App\Models\Course;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CodingPlaygroundTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function user(): User
    {
        $user = User::factory()->create();
        $user->assignRole('student');

        return $user;
    }

    private function course(): Course
    {
        $instructor = User::factory()->create();
        $category = Category::create([
            'name' => 'Programming',
            'slug' => 'programming',
        ]);

        return Course::create([
            'title' => 'Intro to Python',
            'slug' => 'intro-to-python-' . uniqid(),
            'description' => 'A basic course.',
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'level' => 'beginner',
            'status' => 'published',
        ]);
    }

    public function test_playground_requires_authentication(): void
    {
        $this->getJson('/api/lms/playground/workspaces')->assertStatus(401);
        $this->postJson('/api/lms/playground/workspaces', [])->assertStatus(401);
        $this->putJson('/api/lms/playground/workspaces/1', [])->assertStatus(401);
        $this->deleteJson('/api/lms/playground/workspaces/1')->assertStatus(401);
        $this->postJson('/api/lms/playground/run', [])->assertStatus(401);
        $this->postJson('/api/lms/coding-ai/hint', [])->assertStatus(401);
        $this->getJson('/api/lms/coding-leaderboard/for-course/1')->assertStatus(401);
    }

    public function test_run_code_returns_service_unavailable_without_runner(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $this->postJson('/api/lms/playground/run', [
            'code' => 'print(1)',
            'language' => 'python',
        ])->assertStatus(503);
    }

    public function test_run_code_requires_valid_language(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $this->postJson('/api/lms/playground/run', [
            'code' => 'print(1)',
            'language' => 'cobol',
        ])->assertStatus(422);
    }

    public function test_user_can_save_and_load_workspace(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'My Playground',
            'language' => 'python',
            'files' => [
                ['name' => 'main.py', 'content' => 'print("hello")'],
            ],
            'active_file' => 'main.py',
        ])->assertStatus(201)
            ->assertJsonPath('success', true);

        $workspaceId = $response->json('data.id');

        $this->getJson("/api/lms/playground/workspaces/{$workspaceId}/load")
            ->assertOk()
            ->assertJsonPath('data.name', 'My Playground')
            ->assertJsonPath('data.files.0.content', 'print("hello")');
    }

    public function test_user_cannot_load_another_users_workspace(): void
    {
        $owner = $this->user();
        Sanctum::actingAs($owner, ['*']);

        $response = $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Private',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'print(1)']],
        ]);

        $workspaceId = $response->json('data.id');

        $other = $this->user();
        Sanctum::actingAs($other, ['*']);

        $this->getJson("/api/lms/playground/workspaces/{$workspaceId}/load")
            ->assertStatus(404);
    }

    public function test_user_can_update_own_workspace(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Draft',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'print(1)']],
        ])->assertStatus(201);

        $workspaceId = $response->json('data.id');

        $this->putJson("/api/lms/playground/workspaces/{$workspaceId}", [
            'name' => 'Final',
            'language' => 'javascript',
            'files' => [
                ['name' => 'main.js', 'content' => 'console.log(2)'],
                ['name' => 'helper.js', 'content' => 'const x = 1;'],
            ],
            'active_file' => 'main.js',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Final')
            ->assertJsonPath('data.language', 'javascript')
            ->assertJsonCount(2, 'data.files');
    }

    public function test_user_cannot_update_another_users_workspace(): void
    {
        $owner = $this->user();
        Sanctum::actingAs($owner, ['*']);

        $response = $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Private',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'print(1)']],
        ]);

        $workspaceId = $response->json('data.id');

        $other = $this->user();
        Sanctum::actingAs($other, ['*']);

        $this->putJson("/api/lms/playground/workspaces/{$workspaceId}", [
            'name' => 'Hijacked',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'print(2)']],
        ])->assertStatus(404);
    }

    public function test_user_can_delete_own_workspace(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Temp',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'print(1)']],
        ]);

        $workspaceId = $response->json('data.id');

        $this->deleteJson("/api/lms/playground/workspaces/{$workspaceId}")
            ->assertOk();

        $this->assertDatabaseMissing('coding_workspaces', ['id' => $workspaceId]);
    }

    public function test_user_cannot_delete_another_users_workspace(): void
    {
        $owner = $this->user();
        Sanctum::actingAs($owner, ['*']);

        $response = $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Private',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'print(1)']],
        ]);

        $workspaceId = $response->json('data.id');

        $other = $this->user();
        Sanctum::actingAs($other, ['*']);

        $this->deleteJson("/api/lms/playground/workspaces/{$workspaceId}")
            ->assertStatus(404);
    }

    public function test_user_can_list_own_workspaces(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Alpha',
            'language' => 'python',
            'files' => [['name' => 'main.py', 'content' => 'x = 1']],
        ])->assertStatus(201);

        $this->postJson('/api/lms/playground/workspaces', [
            'name' => 'Beta',
            'language' => 'javascript',
            'files' => [['name' => 'main.js', 'content' => 'let y = 2']],
        ])->assertStatus(201);

        $this->getJson('/api/lms/playground/workspaces')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_coding_ai_hint_uses_fallback_when_openai_disabled(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $this->postJson('/api/lms/coding-ai/hint', [
            'code' => 'def add(a, b):\n    return a +',
            'error_message' => 'SyntaxError: invalid syntax',
        ])->assertOk()
            ->assertJsonPath('data.meta.fallback', true);
    }

    public function test_coding_ai_debug_uses_fallback_when_openai_disabled(): void
    {
        Sanctum::actingAs($this->user(), ['*']);

        $this->postJson('/api/lms/coding-ai/debug', [
            'code' => 'print(undefined_var)',
            'error_output' => 'NameError: name undefined_var is not defined',
        ])->assertOk()
            ->assertJsonPath('data.meta.fallback', true);
    }

    public function test_coding_leaderboard_for_exercise(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $course = $this->course();
        $exercise = CodingExercise::create([
            'course_id' => $course->id,
            'author_user_id' => $course->instructor_id,
            'title' => 'Add two numbers',
            'description' => 'Return the sum.',
            'language' => 'python',
            'difficulty' => 'easy',
            'status' => 'published',
        ]);

        CodingSubmission::create([
            'exercise_id' => $exercise->id,
            'user_id' => $user->id,
            'code' => 'def solution(a): return a',
            'status' => 'correct',
            'score' => 100,
            'result' => [],
            'submitted_at' => now(),
        ]);

        $this->getJson("/api/lms/coding-leaderboard/for-exercise/{$exercise->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data.leaderboard')
            ->assertJsonPath('data.leaderboard.0.user_name', $user->name);
    }

    public function test_submit_coding_exercise_without_runner_degrades_gracefully(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, ['*']);

        $course = $this->course();
        $exercise = CodingExercise::create([
            'course_id' => $course->id,
            'author_user_id' => $course->instructor_id,
            'title' => 'Add two numbers',
            'description' => 'Return the sum.',
            'language' => 'python',
            'difficulty' => 'easy',
            'test_cases' => [
                ['input' => [1, 2], 'expected' => 3],
            ],
            'status' => 'published',
        ]);

        $this->postJson("/api/lms/coding-exercises/{$exercise->id}/submit", [
            'code' => 'def solution(a, b): return a + b',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'incorrect');
    }
}
