<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubscriptionTest extends TestCase
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

    public function test_subscription_endpoints_require_authentication(): void
    {
        $this->getJson('/api/subscriptions')->assertStatus(401);
        $this->postJson('/api/subscriptions', [])->assertStatus(401);
    }

    public function test_student_can_list_subscriptions(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user);

        Subscription::create([
            'user_id' => $user->id,
            'plan' => 'monthly',
            'amount' => 2500,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        $this->getJson('/api/subscriptions')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_student_can_create_monthly_subscription(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user);

        $this->postJson('/api/subscriptions', [
            'plan' => 'monthly',
        ])
            ->assertCreated()
            ->assertJsonPath('data.plan', 'monthly')
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan' => 'monthly',
        ]);
    }

    public function test_student_can_create_annual_subscription(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user);

        $this->postJson('/api/subscriptions', [
            'plan' => 'annual',
        ])
            ->assertCreated()
            ->assertJsonPath('data.plan', 'annual')
            ->assertJsonPath('data.amount', '15000.00');
    }

    public function test_invalid_plan_is_rejected(): void
    {
        Sanctum::actingAs($this->studentUser());

        $this->postJson('/api/subscriptions', [
            'plan' => 'premium',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('plan');
    }

    public function test_student_can_cancel_subscription(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user);

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => 'monthly',
            'amount' => 2500,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        $this->postJson("/api/subscriptions/{$subscription->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_student_cannot_cancel_others_subscription(): void
    {
        $user1 = $this->studentUser();
        $user2 = $this->studentUser();

        $subscription = Subscription::create([
            'user_id' => $user1->id,
            'plan' => 'monthly',
            'amount' => 2500,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addMonth(),
        ]);

        Sanctum::actingAs($user2);

        $this->postJson("/api/subscriptions/{$subscription->id}/cancel")
            ->assertStatus(404);
    }

    public function test_subscription_validation_requires_plan(): void
    {
        Sanctum::actingAs($this->studentUser());

        $this->postJson('/api/subscriptions', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('plan');
    }
}
