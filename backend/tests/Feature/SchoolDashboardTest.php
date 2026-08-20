<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SchoolDashboardTest extends TestCase
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

    public function test_school_dashboard_requires_authentication(): void
    {
        $this->getJson('/api/school/dashboard')->assertStatus(401);
    }

    public function test_admin_can_get_school_summary(): void
    {
        Sanctum::actingAs($this->adminUser());

        $response = $this->getJson('/api/school/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'total_students',
                    'total_teachers',
                    'active_courses',
                    'attendance_rate',
                    'total_enrollments',
                    'active_enrollments',
                    'partner_schools',
                ],
            ]);

        $this->assertIsInt($response->json('data.total_students'));
        $this->assertIsInt($response->json('data.total_teachers'));
        $this->assertIsInt($response->json('data.active_courses'));
        $this->assertIsInt($response->json('data.attendance_rate'));
    }

    public function test_student_cannot_access_school_dashboard(): void
    {
        $student = User::factory()->create();
        $student->assignRole('student');
        Sanctum::actingAs($student);

        $this->getJson('/api/school/dashboard')->assertStatus(403);
    }

    public function test_school_summary_attendance_rate_calculation(): void
    {
        Sanctum::actingAs($this->adminUser());

        $student = Student::create([
            'student_id' => 'STU-' . uniqid(),
            'first_name' => 'Test',
            'last_name' => 'Student',
            'status' => 'active',
        ]);

        $student2 = Student::create([
            'student_id' => 'STU-' . uniqid(),
            'first_name' => 'Test2',
            'last_name' => 'Student2',
            'status' => 'active',
        ]);

        \Illuminate\Support\Facades\DB::table('attendances')->insert([
            ['student_id' => $student->id, 'attendance_date' => now()->toDateString(), 'status' => 'present'],
            ['student_id' => $student2->id, 'attendance_date' => now()->toDateString(), 'status' => 'absent'],
        ]);

        $response = $this->getJson('/api/school/dashboard')
            ->assertOk();

        $this->assertEquals(50, $response->json('data.attendance_rate'));
    }
}
