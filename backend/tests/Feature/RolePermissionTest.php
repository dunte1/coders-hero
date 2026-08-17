<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function adminUser(): User
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        return $admin;
    }

    private function studentUser(): User
    {
        $student = User::factory()->create();
        $student->assignRole('student');

        return $student;
    }

    public function test_admin_can_list_roles(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $this->getJson('/api/admin/roles')
            ->assertStatus(200)
            ->assertJsonPath('data.0.name', 'admin');
    }

    public function test_admin_can_create_role(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $this->postJson('/api/admin/roles', [
            'name' => 'content_manager',
            'display_name' => 'Content Manager',
            'description' => 'Manages content.',
        ])->assertStatus(201)
            ->assertJsonPath('data.name', 'content_manager');

        $this->assertDatabaseHas('roles', ['name' => 'content_manager']);
    }

    public function test_admin_can_update_role(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $role = Role::create([
            'name' => 'content_manager',
            'guard_name' => 'web',
            'display_name' => 'Content Manager',
        ]);

        $this->putJson('/api/admin/roles/' . $role->id, [
            'display_name' => 'Senior Content Manager',
        ])->assertStatus(200)
            ->assertJsonPath('data.display_name', 'Senior Content Manager');
    }

    public function test_admin_can_sync_role_permissions(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $role = Role::create([
            'name' => 'content_manager',
            'guard_name' => 'web',
        ]);

        $this->putJson('/api/admin/roles/' . $role->id . '/permissions', [
            'permissions' => ['view_courses', 'view_announcements'],
        ])->assertStatus(200);

        $this->assertTrue($role->fresh()->hasPermissionTo('view_courses'));
        $this->assertTrue($role->fresh()->hasPermissionTo('view_announcements'));
    }

    public function test_admin_can_get_role_permissions_and_users(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $role = Role::where('name', 'admin')->first();

        $this->getJson('/api/admin/roles/' . $role->id . '/permissions')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);

        $this->getJson('/api/admin/roles/' . $role->id . '/users')
            ->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_admin_can_delete_role(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $role = Role::create([
            'name' => 'temp_role',
            'guard_name' => 'web',
        ]);

        $this->deleteJson('/api/admin/roles/' . $role->id)
            ->assertStatus(200);

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_super_admin_role_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $superAdmin = Role::where('name', 'super_admin')->first();

        $this->deleteJson('/api/admin/roles/' . $superAdmin->id)
            ->assertStatus(403);
    }

    public function test_role_assigned_to_users_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $role = Role::create([
            'name' => 'temp_role',
            'guard_name' => 'web',
        ]);

        $this->adminUser()->assignRole('temp_role');

        $this->deleteJson('/api/admin/roles/' . $role->id)
            ->assertStatus(422);
    }

    public function test_non_admin_gets_forbidden(): void
    {
        Sanctum::actingAs($this->studentUser(), ['*']);

        $this->getJson('/api/admin/roles')->assertStatus(403);
        $this->getJson('/api/admin/permissions')->assertStatus(403);
    }

    public function test_permission_list_and_groups_work(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $this->getJson('/api/admin/permissions')
            ->assertStatus(200)
            ->assertJsonStructure(['data', 'meta']);

        $response = $this->getJson('/api/admin/permissions/groups')
            ->assertStatus(200);

        $this->assertArrayHasKey('users', $response->json('data'));
        $this->assertArrayHasKey('courses', $response->json('data'));
    }

    public function test_permission_can_be_shown(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $permission = \Spatie\Permission\Models\Permission::where('name', 'view_courses')->first();

        $this->getJson('/api/admin/permissions/' . $permission->id)
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'view_courses');
    }

    public function test_admin_can_sync_user_permissions(): void
    {
        Sanctum::actingAs($this->adminUser(), ['*']);

        $user = $this->studentUser();

        $this->putJson('/api/admin/users/' . $user->id . '/permissions', [
            'permissions' => ['view_courses', 'view_reports'],
        ])->assertStatus(200);

        $fresh = $user->fresh();
        $this->assertTrue($fresh->hasPermissionTo('view_courses'));
        $this->assertTrue($fresh->hasPermissionTo('view_reports'));
    }
}
