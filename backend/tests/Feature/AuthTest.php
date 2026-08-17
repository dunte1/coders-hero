<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+1-555-9999',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.email', 'test@example.com')
            ->assertJsonPath('data.requires_email_verification', true)
            ->assertJsonStructure(['data' => ['user', 'token', 'requires_email_verification']]);

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
        $this->assertNull(User::where('email', 'test@example.com')->first()->email_verified_at);
        $this->assertTrue(User::where('email', 'test@example.com')->first()->hasRole('student'));
    }

    public function test_duplicate_email_registration_fails(): void
    {
        User::factory()->create(['email' => 'dup@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Duplicate',
            'email' => 'dup@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(422);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.requires_two_factor', false)
            ->assertJsonPath('data.user.email', 'login@example.com')
            ->assertJsonStructure(['data' => ['token', 'user', 'requires_two_factor']]);
    }

    public function test_login_with_wrong_password_fails(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'wrongpassword',
        ])->assertStatus(422);
    }

    public function test_logout_deletes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/logout', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_profile_requires_auth(): void
    {
        $this->getJson('/api/profile')->assertStatus(401);
    }

    public function test_change_password_works(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/change-password', [
            'current_password' => 'oldpassword',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ], ['Authorization' => 'Bearer ' . $token])->assertStatus(200);

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_update_profile_works(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->putJson('/api/profile', [
            'name' => 'Updated Name',
            'phone' => '+1-555-1111',
        ], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Updated Name');
    }
}
