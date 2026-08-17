<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\SendPasswordResetLink;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/api/forgot-password', ['email' => 'reset@example.com'])
            ->assertStatus(200);

        Notification::assertSentTo($user, SendPasswordResetLink::class);
    }

    public function test_reset_with_valid_token_updates_password_and_allows_login(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $token = Password::broker()->createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => 'reset@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertStatus(200);

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));

        $this->postJson('/api/login', [
            'email' => 'reset@example.com',
            'password' => 'newpassword123',
        ])->assertStatus(200);
    }

    public function test_reset_with_invalid_token_fails(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => Hash::make('oldpassword'),
        ]);

        $this->postJson('/api/reset-password', [
            'token' => 'invalid-token',
            'email' => 'reset@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ])->assertStatus(422);

        $this->assertTrue(Hash::check('oldpassword', $user->fresh()->password));
    }

    public function test_validate_reset_token_returns_valid(): void
    {
        $user = User::factory()->create(['email' => 'reset@example.com']);
        $token = Password::broker()->createToken($user);

        $this->postJson('/api/reset-password/validate', [
            'token' => $token,
            'email' => 'reset@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('data.valid', true);
    }

    public function test_validate_reset_token_returns_invalid(): void
    {
        $user = User::factory()->create(['email' => 'reset@example.com']);

        $this->postJson('/api/reset-password/validate', [
            'token' => 'invalid-token',
            'email' => 'reset@example.com',
        ])->assertStatus(200)
            ->assertJsonPath('data.valid', false);
    }
}
