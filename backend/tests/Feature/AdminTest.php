<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    // ── Activity Logs ─────────────────────────────────────────────────────

    public function test_admin_can_list_activity_logs(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('admin')
        );

        $this->getJson('/api/admin/activity-logs')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_non_admin_cannot_list_activity_logs(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('student')
        );

        $this->getJson('/api/admin/activity-logs')
            ->assertStatus(403);
    }

    public function test_admin_can_list_activity_events(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('admin')
        );

        $this->getJson('/api/admin/activity-logs/events')
            ->assertOk()
            ->assertJsonStructure(['success', 'data']);
    }

    // ── System Health ─────────────────────────────────────────────────────

    public function test_super_admin_can_check_system_health(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('super_admin')
        );

        $this->getJson('/api/admin/system/health')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'app' => ['name', 'env', 'debug', 'url', 'version', 'php_version', 'timezone'],
                    'database' => ['connection', 'driver', 'healthy'],
                    'cache',
                    'queue',
                    'session',
                    'storage' => ['writable', 'disk'],
                    'system' => ['memory_used_mb', 'request_time', 'server_time'],
                ],
            ]);
    }

    public function test_admin_cannot_check_system_health(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('admin')
        );

        $this->getJson('/api/admin/system/health')
            ->assertStatus(403);
    }

    // ── System Logs ───────────────────────────────────────────────────────

    public function test_super_admin_can_read_system_logs(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('super_admin')
        );

        $this->getJson('/api/admin/system/logs?lines=50')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['lines'],
            ]);
    }

    public function test_admin_cannot_read_system_logs(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('admin')
        );

        $this->getJson('/api/admin/system/logs')
            ->assertStatus(403);
    }

    // ── Backups ───────────────────────────────────────────────────────────

    public function test_super_admin_can_list_backups(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('super_admin')
        );

        $this->getJson('/api/admin/system/backups')
            ->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['backups'],
            ]);
    }

    public function test_admin_cannot_list_backups(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('admin')
        );

        $this->getJson('/api/admin/system/backups')
            ->assertStatus(403);
    }

    public function test_student_cannot_create_backup(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('student')
        );

        $this->postJson('/api/admin/system/backups')
            ->assertStatus(403);
    }

    public function test_non_admin_cannot_delete_backup(): void
    {
        Sanctum::actingAs(
            User::factory()->create()->assignRole('teacher')
        );

        $this->deleteJson('/api/admin/system/backups?name=backup-20260101-120000-abc.sqlite')
            ->assertStatus(403);
    }

    // ── New roles exist ───────────────────────────────────────────────────

    public function test_new_roles_were_seeded(): void
    {
        $roles = ['director', 'branch_manager', 'school_admin', 'accountant'];

        foreach ($roles as $role) {
            $this->assertDatabaseHas('roles', [
                'name' => $role,
                'guard_name' => 'web',
            ]);
        }
    }

    public function test_admin_has_all_roles(): void
    {
        $user = User::factory()->create()->assignRole('admin');
        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('director'));
    }
}
