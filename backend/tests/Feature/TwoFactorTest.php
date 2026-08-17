<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    private function google2fa(): Google2FA
    {
        return app(Google2FA::class);
    }

    public function test_enable_returns_secret_and_recovery_codes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['secret', 'qr_code_url', 'otp_url', 'recovery_codes']]);

        $data = $response->json('data');

        $this->assertCount(10, $data['recovery_codes']);
        $this->assertStringStartsWith('data:image/png;base64,', $data['qr_code_url']);
        $this->assertNotNull($user->fresh()->two_factor_secret);
    }

    public function test_confirm_with_wrong_code_fails(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token]);

        $this->postJson('/api/two-factor/confirm', ['code' => '000000'], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(422);

        $this->assertFalse($user->fresh()->two_factor_enabled);
    }

    public function test_confirm_with_correct_code_enables(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $secret = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token])
            ->json('data.secret');

        $code = $this->google2fa()->getCurrentOtp($secret);

        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        $fresh = $user->fresh();
        $this->assertTrue($fresh->two_factor_enabled);
        $this->assertNotNull($fresh->two_factor_confirmed_at);
    }

    public function test_disable_requires_password(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $secret = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token])
            ->json('data.secret');
        $code = $this->google2fa()->getCurrentOtp($secret);
        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token]);

        $this->postJson('/api/two-factor/disable', ['current_password' => 'wrong'], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(422);

        $this->postJson('/api/two-factor/disable', ['current_password' => 'password'], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        $fresh = $user->fresh();
        $this->assertFalse($fresh->two_factor_enabled);
        $this->assertNull($fresh->two_factor_confirmed_at);
    }

    public function test_login_with_2fa_requires_challenge(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $secret = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token])
            ->json('data.secret');
        $code = $this->google2fa()->getCurrentOtp($secret);
        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(200)
            ->assertJsonPath('data.requires_two_factor', true)
            ->assertJsonStructure(['data' => ['token', 'user', 'requires_two_factor']]);
    }

    public function test_challenge_with_pending_token_issues_real_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $secret = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token])
            ->json('data.secret');
        $code = $this->google2fa()->getCurrentOtp($secret);
        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        $pendingToken = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->json('data.token');

        $currentCode = $this->google2fa()->getCurrentOtp($secret);

        $response = $this->postJson('/api/two-factor/challenge', ['code' => $currentCode], ['Authorization' => 'Bearer ' . $pendingToken]);

        $response->assertStatus(200)
            ->assertJsonPath('data.requires_two_factor', false)
            ->assertJsonStructure(['data' => ['token', 'user', 'requires_two_factor']]);

        $this->assertNotEquals($pendingToken, $response->json('data.token'));
    }

    public function test_challenge_with_recovery_code_issues_real_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $enable = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token]);
        $recoveryCode = $enable->json('data.recovery_codes.0');

        $code = $this->google2fa()->getCurrentOtp($enable->json('data.secret'));
        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200);

        $pendingToken = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->json('data.token');

        $this->postJson('/api/two-factor/challenge', ['recovery_code' => $recoveryCode], ['Authorization' => 'Bearer ' . $pendingToken])
            ->assertStatus(200)
            ->assertJsonPath('data.requires_two_factor', false);

        $this->assertCount(9, $user->fresh()->getTwoFactorRecoveryCodes());
    }

    public function test_challenge_rejects_non_pending_token(): void
    {
        $user = User::factory()->create(['password' => Hash::make('password')]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $secret = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token])
            ->json('data.secret');
        $code = $this->google2fa()->getCurrentOtp($secret);
        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token]);

        $this->postJson('/api/two-factor/challenge', ['code' => $this->google2fa()->getCurrentOtp($secret)], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(403);
    }

    public function test_recovery_codes_can_be_regenerated(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token]);

        $this->postJson('/api/two-factor/recovery-codes', [], ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['recovery_codes']]);

        $this->assertCount(10, $user->fresh()->getTwoFactorRecoveryCodes());
    }

    public function test_status_returns_enabled_flag(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $secret = $this->postJson('/api/two-factor/enable', [], ['Authorization' => 'Bearer ' . $token])->json('data.secret');
        $code = $this->google2fa()->getCurrentOtp($secret);
        $this->postJson('/api/two-factor/confirm', ['code' => $code], ['Authorization' => 'Bearer ' . $token]);

        $this->getJson('/api/two-factor/status', ['Authorization' => 'Bearer ' . $token])
            ->assertStatus(200)
            ->assertJsonPath('data.enabled', true);
    }
}
