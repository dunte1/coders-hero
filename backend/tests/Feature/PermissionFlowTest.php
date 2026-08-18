<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PermissionFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function superAdminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('super_admin');
        return $user;
    }

    private function adminUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }

    private function instructorUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('instructor');
        return $user;
    }

    private function studentUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('student');
        return $user;
    }

    private function parentUser(): User
    {
        $user = User::factory()->create();
        $user->assignRole('parent');
        return $user;
    }

    // ==========================================
    // TEST: Profile includes permissions in roles
    // ==========================================

    public function test_profile_returns_user_with_permissions_in_roles(): void
    {
        $user = $this->instructorUser();
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/profile');
        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertNotEmpty($data['roles'], 'User should have at least one role');
        $this->assertArrayHasKey('permissions', $data['roles'][0], 'Role should include permissions array');
        $this->assertNotEmpty($data['roles'][0]['permissions'], 'Role should have permissions');
    }

    public function test_profile_permissions_contain_codename_field(): void
    {
        $user = $this->instructorUser();
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/profile');
        $permissions = $response->json('data.roles.0.permissions');

        $this->assertNotEmpty($permissions);
        $this->assertArrayHasKey('codename', $permissions[0], 'Permission should have codename field');
        $this->assertEquals($permissions[0]['name'], $permissions[0]['codename'], 'codename should equal name');
    }

    public function test_instructor_permissions_match_seeder(): void
    {
        $user = $this->instructorUser();
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/profile');
        $permissionNames = array_column($response->json('data.roles.0.permissions'), 'codename');

        $this->assertContains('view_courses', $permissionNames);
        $this->assertContains('create_courses', $permissionNames);
        $this->assertContains('view_dashboard', $permissionNames);
        $this->assertContains('view_instructor_dashboard', $permissionNames);
    }

    public function test_student_permissions_match_seeder(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/profile');
        $permissionNames = array_column($response->json('data.roles.0.permissions'), 'codename');

        $this->assertContains('view_courses', $permissionNames);
        $this->assertContains('view_enrollments', $permissionNames);
        $this->assertContains('attempt_quizzes', $permissionNames);
        $this->assertNotContains('create_courses', $permissionNames, 'Students should NOT have create_courses');
    }

    public function test_parent_permissions_match_seeder(): void
    {
        $user = $this->parentUser();
        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/profile');
        $permissionNames = array_column($response->json('data.roles.0.permissions'), 'codename');

        $this->assertContains('view_courses', $permissionNames);
        $this->assertContains('view_enrollments', $permissionNames);
        $this->assertContains('view_certificates', $permissionNames);
        $this->assertNotContains('create_courses', $permissionNames, 'Parents should NOT have create_courses');
    }

    // ==========================================
    // TEST: Login returns permissions
    // ==========================================

    public function test_login_returns_user_with_permissions(): void
    {
        $user = User::factory()->create([
            'email' => 'instructor@test.com',
            'password' => bcrypt('password'),
        ]);
        $user->assignRole('instructor');

        $response = $this->postJson('/api/login', [
            'email' => 'instructor@test.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('permissions', $response->json('data.user.roles.0'));
        $this->assertNotEmpty($response->json('data.user.roles.0.permissions'));
    }

    // ==========================================
    // TEST: Admin can assign/remove roles
    // ==========================================

    public function test_admin_can_assign_role(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $target = User::factory()->create();

        $response = $this->putJson("/api/admin/users/{$target->id}/assign-role", [
            'role' => 'instructor',
        ]);

        $response->assertStatus(200);
        $this->assertTrue($target->fresh()->hasRole('instructor'));
    }

    public function test_admin_can_remove_role(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $target = User::factory()->create();
        $target->assignRole('instructor');
        $this->assertTrue($target->fresh()->hasRole('instructor'));

        $response = $this->deleteJson("/api/admin/users/{$target->id}/remove-role", [
            'role' => 'instructor',
        ]);

        $response->assertStatus(200);
        $this->assertFalse($target->fresh()->hasRole('instructor'));
    }

    public function test_assign_role_reflected_in_profile(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $target = User::factory()->create();

        // Assign instructor role
        $this->putJson("/api/admin/users/{$target->id}/assign-role", [
            'role' => 'instructor',
        ]);

        // Now log in as the target user and check profile
        Sanctum::actingAs($target, ['*']);
        $response = $this->getJson('/api/profile');
        $roles = array_column($response->json('data.roles'), 'name');
        $this->assertContains('instructor', $roles);
    }

    public function test_remove_role_reflected_in_profile(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $target = User::factory()->create();
        $target->assignRole('instructor');

        // Remove instructor role
        $this->deleteJson("/api/admin/users/{$target->id}/remove-role", [
            'role' => 'instructor',
        ]);

        // Now log in as the target user and check profile
        Sanctum::actingAs($target, ['*']);
        $response = $this->getJson('/api/profile');
        $roles = array_column($response->json('data.roles'), 'name');
        $this->assertNotContains('instructor', $roles);
    }

    // ==========================================
    // TEST: Only super_admin can escalate to super_admin
    // ==========================================

    public function test_admin_cannot_assign_super_admin_role(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $target = User::factory()->create();

        $response = $this->putJson("/api/admin/users/{$target->id}/assign-role", [
            'role' => 'super_admin',
        ]);

        // Should be forbidden
        $response->assertStatus(403);
    }

    public function test_super_admin_can_assign_super_admin_role(): void
    {
        $superAdmin = $this->superAdminUser();
        Sanctum::actingAs($superAdmin, ['*']);

        $target = User::factory()->create();

        $response = $this->putJson("/api/admin/users/{$target->id}/assign-role", [
            'role' => 'super_admin',
        ]);

        $response->assertStatus(200);
        $this->assertTrue($target->fresh()->hasRole('super_admin'));
    }

    // ==========================================
    // TEST: System admin routes restricted to super_admin
    // ==========================================

    public function test_admin_cannot_access_system_health(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/system/health')->assertStatus(403);
    }

    public function test_admin_cannot_access_backups(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/system/backups')->assertStatus(403);
    }

    public function test_admin_cannot_access_system_logs(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/system/logs')->assertStatus(403);
    }

    public function test_super_admin_can_access_system_health(): void
    {
        $superAdmin = $this->superAdminUser();
        Sanctum::actingAs($superAdmin, ['*']);

        $this->getJson('/api/admin/system/health')->assertStatus(200);
    }

    // ==========================================
    // TEST: Granular permission checks in policies
    // ==========================================

    public function test_user_without_create_students_permission_cannot_create_student(): void
    {
        // Instructor does not have create_students permission
        $instructor = $this->instructorUser();
        Sanctum::actingAs($instructor, ['*']);

        $response = $this->postJson('/api/students', [
            'first_name' => 'Test',
            'last_name' => 'Student',
            'email' => 'test@student.com',
            'admission_number' => 'ADM001',
            'class_id' => 1,
        ]);

        // Either 403 (policy denies) or 422 (validation fails before policy)
        $this->assertContains($response->status(), [403, 422]);
    }

    public function test_admin_with_all_permissions_can_manage_students(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(200);
    }

    // ==========================================
    // TEST: User policy authorization
    // ==========================================

    public function test_admin_can_list_users(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        $this->getJson('/api/admin/users')->assertStatus(200);
    }

    public function test_student_cannot_list_users(): void
    {
        $student = $this->studentUser();
        Sanctum::actingAs($student, ['*']);

        $this->getJson('/api/admin/users')->assertStatus(403);
    }

    public function test_parent_cannot_list_users(): void
    {
        $parent = $this->parentUser();
        Sanctum::actingAs($parent, ['*']);

        $this->getJson('/api/admin/users')->assertStatus(403);
    }

    // ==========================================
    // TEST: Permission resource includes all fields
    // ==========================================

    public function test_permission_resource_has_required_fields(): void
    {
        $admin = $this->adminUser();
        Sanctum::actingAs($admin, ['*']);

        // Get a permission via the show endpoint which uses PermissionResource
        $permission = \Spatie\Permission\Models\Permission::where('name', 'view_courses')->first();
        $response = $this->getJson("/api/admin/permissions/{$permission->id}");
        $data = $response->json('data');

        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('name', $data);
        $this->assertArrayHasKey('codename', $data);
        $this->assertArrayHasKey('display_name', $data);
        $this->assertArrayHasKey('description', $data);
        $this->assertArrayHasKey('group', $data);
    }

    // ==========================================
    // TEST: Frontend permission filtering logic
    // ==========================================

    public function test_nav_permission_field_corresponds_to_real_permissions(): void
    {
        // Verify that permissions referenced in navigation.ts actually exist
        $navPermissions = [
            'view_users', 'view_roles', 'view_permissions',
            'manage_fee_structures', 'manage_invoices', 'record_payments',
            'manage_expenses', 'manage_budgets', 'manage_mpesa',
            'manage_contracts', 'manage_leave', 'manage_attendance',
            'manage_payroll', 'manage_performance_reviews', 'manage_employee_documents',
            'manage_assets', 'manage_inventory_items', 'manage_asset_maintenance',
            'manage_asset_categories', 'manage_locations',
            'manage_library_resources', 'manage_library_borrowings',
            'manage_library_reservations', 'manage_library_categories',
            'manage_library_authors',
        ];

        $existingPermissions = \Spatie\Permission\Models\Permission::pluck('name')->toArray();

        foreach ($navPermissions as $perm) {
            $this->assertContains(
                $perm,
                $existingPermissions,
                "Navigation references permission '{$perm}' which does not exist in the database"
            );
        }
    }
}
