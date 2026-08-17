<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_verification_link_sends_notification(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/email/verification-notification', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_resend_creates_signed_url(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/email/resend', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        Notification::assertSentTo($user, VerifyEmailNotification::class, function (VerifyEmailNotification $notification) use ($user) {
            return str_contains($notification->verificationUrl, '/api/email/verify/');
        });
    }

    public function test_verify_endpoint_marks_verified(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->getKey(),
            'hash' => sha1($user->email),
        ]);

        $this->getJson($url)
            ->assertStatus(200);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verify_with_invalid_signature_fails(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->getKey(),
            'hash' => sha1($user->email),
        ]);

        $this->getJson($url . '&tampered=1')
            ->assertStatus(422);
    }

    public function test_resend_when_already_verified_returns_message(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email_verified_at' => now()]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/email/resend', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJsonPath('message', 'Email is already verified.');

        Notification::assertNothingSent();
    }
}
