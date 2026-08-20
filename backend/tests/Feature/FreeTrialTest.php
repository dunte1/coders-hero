<?php

namespace Tests\Feature;

use App\Models\FreeTrialBooking;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use Tests\TestCase;

class FreeTrialTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_free_trial_can_be_booked(): void
    {
        $response = $this->postJson('/api/free-trial', [
            'parent_name' => 'Jane Doe',
            'phone' => '+254712345678',
            'email' => 'jane@example.com',
            'child_name' => 'John Doe',
            'grade' => 'Grade 5',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'parent_name', 'phone', 'child_name', 'grade']]);

        $this->assertDatabaseHas('free_trial_bookings', [
            'email' => 'jane@example.com',
        ]);
    }

    public function test_free_trial_validation_requires_fields(): void
    {
        $this->postJson('/api/free-trial', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['parent_name', 'phone', 'child_name', 'grade']);
    }

    public function test_free_trial_validates_email_format(): void
    {
        $this->postJson('/api/free-trial', [
            'parent_name' => 'Jane',
            'phone' => '+254712345678',
            'email' => 'not-an-email',
            'child_name' => 'John',
            'grade' => 'Grade 3',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_free_trial_can_include_notes(): void
    {
        $this->postJson('/api/free-trial', [
            'parent_name' => 'Jane',
            'phone' => '+254712345678',
            'email' => 'jane@example.com',
            'child_name' => 'John',
            'grade' => 'Grade 5',
        ])
            ->assertCreated();

        $this->assertDatabaseHas('free_trial_bookings', [
            'email' => 'jane@example.com',
            'child_name' => 'John',
        ]);
    }

    public function test_free_trial_defaults_to_pending_status(): void
    {
        $response = $this->postJson('/api/free-trial', [
            'parent_name' => 'Test',
            'phone' => '+254700000000',
            'email' => 'test@example.com',
            'child_name' => 'Child',
            'grade' => 'Grade 1',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('free_trial_bookings', [
            'status' => 'pending',
        ]);
    }

    public function test_free_trial_can_be_listed_by_admin(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        Sanctum::actingAs($user);

        FreeTrialBooking::create([
            'parent_name' => 'Parent 1',
            'phone' => '+254700000001',
            'email' => 'p1@example.com',
            'child_name' => 'Child 1',
            'grade' => 'Grade 2',
            'status' => 'pending',
        ]);

        $this->getJson('/api/admin/free-trial-bookings')
            ->assertOk();
    }

    public function test_non_admin_cannot_list_free_trial_bookings(): void
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/free-trial-bookings')->assertStatus(403);
    }
}
