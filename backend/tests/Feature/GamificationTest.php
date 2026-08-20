<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\LearningStreak;
use App\Models\PointsTransaction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GamificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function studentUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        return $user;
    }

    public function test_gamification_endpoints_require_authentication(): void
    {
        $this->getJson('/api/gamification/streak')->assertStatus(401);
        $this->getJson('/api/gamification/badges')->assertStatus(401);
        $this->getJson('/api/gamification/points')->assertStatus(401);
        $this->getJson('/api/gamification/leaderboard')->assertStatus(401);
    }

    public function test_student_can_get_streak(): void
    {
        Sanctum::actingAs($this->studentUser());

        $response = $this->getJson('/api/gamification/streak')
            ->assertOk()
            ->assertJsonStructure(['data' => ['id', 'user_id', 'current_streak', 'longest_streak']]);

        $this->assertDatabaseHas('learning_streaks', [
            'user_id' => auth()->id(),
            'current_streak' => 0,
        ]);
    }

    public function test_streak_is_created_only_once(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user);

        $this->getJson('/api/gamification/streak')->assertOk();
        $this->getJson('/api/gamification/streak')->assertOk();

        $this->assertCount(1, LearningStreak::where('user_id', $user->id)->get());
    }

    public function test_student_can_get_badges(): void
    {
        Sanctum::actingAs($this->studentUser());

        Badge::create(['name' => 'First Lesson', 'slug' => 'first-lesson', 'points' => 10]);
        Badge::create(['name' => 'Quiz Master', 'slug' => 'quiz-master', 'points' => 50]);

        $response = $this->getJson('/api/gamification/badges')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertEquals('First Lesson', $response->json('data.0.name'));
    }

    public function test_student_can_get_points(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user);

        PointsTransaction::create(['user_id' => $user->id, 'points' => 10, 'type' => 'earned', 'description' => 'Completed lesson']);
        PointsTransaction::create(['user_id' => $user->id, 'points' => 5, 'type' => 'earned', 'description' => 'Quiz passed']);

        $response = $this->getJson('/api/gamification/points')
            ->assertOk()
            ->assertJsonPath('data.total_points', 15)
            ->assertJsonCount(2, 'data.recent_transactions');
    }

    public function test_leaderboard_shows_top_users(): void
    {
        Sanctum::actingAs($this->studentUser());

        $user1 = User::factory()->create(['name' => 'Alice']);
        $user2 = User::factory()->create(['name' => 'Bob']);

        PointsTransaction::create(['user_id' => $user1->id, 'points' => 100, 'type' => 'earned', 'description' => 'Activity']);
        PointsTransaction::create(['user_id' => $user1->id, 'points' => 50, 'type' => 'earned', 'description' => 'Activity']);
        PointsTransaction::create(['user_id' => $user2->id, 'points' => 75, 'type' => 'earned', 'description' => 'Activity']);

        $response = $this->getJson('/api/gamification/leaderboard')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertEquals($user1->id, $response->json('data.0.user_id'));
        $this->assertEquals(150, $response->json('data.0.total_points'));
    }

    public function test_leaderboard_includes_user_info(): void
    {
        Sanctum::actingAs($this->studentUser());

        $user = User::factory()->create(['name' => 'Charlie']);
        PointsTransaction::create(['user_id' => $user->id, 'points' => 50, 'type' => 'earned', 'description' => 'Activity']);

        $response = $this->getJson('/api/gamification/leaderboard')
            ->assertOk();

        $this->assertArrayHasKey('user', $response->json('data.0'));
        $this->assertEquals('Charlie', $response->json('data.0.user.name'));
    }

    public function test_leaderboard_is_limited_to_50(): void
    {
        Sanctum::actingAs($this->studentUser());

        for ($i = 0; $i < 60; $i++) {
            $u = User::factory()->create();
            PointsTransaction::create(['user_id' => $u->id, 'points' => $i, 'type' => 'earned', 'description' => 'Activity']);
        }

        $response = $this->getJson('/api/gamification/leaderboard')
            ->assertOk()
            ->assertJsonCount(50, 'data');
    }

    public function test_non_student_cannot_access_gamification(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/gamification/streak')->assertStatus(200);
        $this->getJson('/api/gamification/badges')->assertStatus(200);
        $this->getJson('/api/gamification/points')->assertStatus(200);
        $this->getJson('/api/gamification/leaderboard')->assertStatus(200);
    }
}
