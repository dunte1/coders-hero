<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LoginHistoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_failed_login_records_failed_history(): void
    {
        $user = User::factory()->create([
            'email' => 'history@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'history@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(422);

        $this->assertDatabaseHas('login_histories', [
            'user_id' => $user->id,
            'status' => 'failed',
        ]);
    }

    public function test_successful_login_records_success_history(): void
    {
        $user = User::factory()->create([
            'email' => 'history@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'history@example.com',
            'password' => 'password123',
        ])->assertStatus(200);

        $this->assertDatabaseHas('login_histories', [
            'user_id' => $user->id,
            'status' => 'success',
        ]);
    }

    public function test_user_can_list_own_history(): void
    {
        $user = User::factory()->create();
        $user->loginHistories()->create([
            'status' => 'success',
            'attempted_at' => now(),
            'logged_in_at' => now(),
        ]);
        $user->loginHistories()->create([
            'status' => 'failed',
            'attempted_at' => now()->subMinutes(5),
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/login-history')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_clear_own_history(): void
    {
        $user = User::factory()->create();
        $user->loginHistories()->create([
            'status' => 'success',
            'attempted_at' => now(),
        ]);

        Sanctum::actingAs($user, ['*']);

        $this->deleteJson('/api/login-history')
            ->assertStatus(200);

        $this->assertDatabaseMissing('login_histories', ['user_id' => $user->id]);
    }

    public function test_admin_can_list_all_history(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $other = User::factory()->create();
        $other->loginHistories()->create([
            'status' => 'success',
            'attempted_at' => now(),
            'logged_in_at' => now(),
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/login-history')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_show_single_record(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $other = User::factory()->create();
        $history = $other->loginHistories()->create([
            'status' => 'success',
            'attempted_at' => now(),
            'logged_in_at' => now(),
        ]);

        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/login-history/' . $history->id)
            ->assertStatus(200)
            ->assertJsonPath('data.id', $history->id);
    }
}
