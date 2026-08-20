<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RefundTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    private function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function studentUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        return $user;
    }

    private function createPayment(): Payment
    {
        return Payment::create([
            'receipt_no' => 'RCPT-' . uniqid(),
            'amount' => 5000,
            'method' => 'cash',
            'paid_at' => now(),
        ]);
    }

    public function test_refund_endpoints_require_authentication(): void
    {
        $this->postJson('/api/admin/refunds', [])->assertStatus(401);
        $this->getJson('/api/admin/refunds')->assertStatus(401);
    }

    public function test_student_cannot_access_refund_endpoints(): void
    {
        Sanctum::actingAs($this->studentUser());

        $this->getJson('/api/admin/refunds')->assertStatus(403);
        $this->postJson('/api/admin/refunds', [])->assertStatus(403);
    }

    public function test_admin_can_request_refund(): void
    {
        Sanctum::actingAs($this->adminUser());

        $payment = $this->createPayment();

        $this->postJson('/api/admin/refunds', [
            'payment_id' => $payment->id,
            'amount' => 2000,
            'reason' => 'Changed my mind',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('refunds', [
            'payment_id' => $payment->id,
            'status' => 'pending',
        ]);
    }

    public function test_admin_can_list_all_refunds(): void
    {
        Sanctum::actingAs($this->adminUser());

        $payment = $this->createPayment();
        Refund::create([
            'payment_id' => $payment->id,
            'user_id' => $this->adminUser()->id,
            'amount' => 1000,
            'reason' => 'Test refund',
            'status' => 'pending',
        ]);

        $this->getJson('/api/admin/refunds')
            ->assertOk();
    }

    public function test_admin_can_approve_refund(): void
    {
        Sanctum::actingAs($this->adminUser());

        $payment = $this->createPayment();
        $refund = Refund::create([
            'payment_id' => $payment->id,
            'user_id' => $this->adminUser()->id,
            'amount' => 2000,
            'reason' => 'Overcharge',
            'status' => 'pending',
        ]);

        $this->postJson("/api/admin/refunds/{$refund->id}/approve", [
            'admin_notes' => 'Approved after review',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('refunds', [
            'id' => $refund->id,
            'status' => 'approved',
        ]);
    }

    public function test_admin_can_reject_refund(): void
    {
        Sanctum::actingAs($this->adminUser());

        $payment = $this->createPayment();
        $refund = Refund::create([
            'payment_id' => $payment->id,
            'user_id' => $this->adminUser()->id,
            'amount' => 2000,
            'reason' => 'Invalid reason',
            'status' => 'pending',
        ]);

        $this->postJson("/api/admin/refunds/{$refund->id}/reject", [
            'admin_notes' => 'Not valid',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');
    }

    public function test_non_admin_cannot_approve_refund(): void
    {
        $student = $this->studentUser();
        Sanctum::actingAs($student);

        $payment = $this->createPayment();
        $refund = Refund::create([
            'payment_id' => $payment->id,
            'user_id' => $student->id,
            'amount' => 1000,
            'reason' => 'Test',
            'status' => 'pending',
        ]);

        $this->postJson("/api/admin/refunds/{$refund->id}/approve")->assertStatus(403);
        $this->postJson("/api/admin/refunds/{$refund->id}/reject")->assertStatus(403);
    }

    public function test_refund_validation_requires_fields(): void
    {
        Sanctum::actingAs($this->adminUser());

        $this->postJson('/api/admin/refunds', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['payment_id', 'amount', 'reason']);
    }
}
