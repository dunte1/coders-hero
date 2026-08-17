<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Category;
use App\Models\Competition;
use App\Models\CompetitionTeam;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);

        Cache::flush();
    }

    private function user(string $role = 'admin'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function student(string $branch = 'Main Campus', ?User $user = null): Student
    {
        $studentUser = $user ?? $this->user('student');

        return Student::create([
            'student_id' => 'STU-' . uniqid(),
            'user_id' => $studentUser->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'grade' => 'Grade 7',
            'branch' => $branch,
            'admission_date' => now()->subYear(),
            'status' => 'active',
        ]);
    }

    private function course(?User $instructor = null): Course
    {
        $instructor ??= User::factory()->create();
        $category = Category::create(['name' => 'Science ' . uniqid(), 'slug' => 'science-' . uniqid()]);

        return Course::create([
            'title' => 'Physics ' . uniqid(),
            'slug' => 'physics-' . uniqid(),
            'description' => 'Test course.',
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'level' => 'beginner',
            'status' => 'published',
        ]);
    }

    private function seedData(): void
    {
        $student = $this->student();
        $course = $this->course();

        Enrollment::create([
            'user_id' => $student->user_id,
            'course_id' => $course->id,
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => now()->subWeek(),
            'progress' => 100,
        ]);
        Enrollment::create([
            'user_id' => $this->user('student')->id,
            'course_id' => $course->id,
            'status' => 'active',
            'enrolled_at' => now()->subMonth(),
            'progress' => 45,
        ]);

        $invoice = Invoice::create([
            'invoice_no' => 'INV-' . uniqid(),
            'student_id' => $student->id,
            'term' => 'Term 1',
            'amount' => 1000,
            'paid_amount' => 400,
            'status' => 'partial',
            'issued_at' => now()->subMonth(),
            'due_date' => now()->addWeek(),
            'created_by_user_id' => $this->user('admin')->id,
        ]);

        Payment::create([
            'invoice_id' => $invoice->id,
            'receipt_no' => 'RCP-' . uniqid(),
            'amount' => 400,
            'method' => 'cash',
            'paid_at' => now()->subDays(5),
            'paid_by_user_id' => $this->user('admin')->id,
        ]);

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => today()->subDay(),
            'status' => 'present',
            'recorded_by' => $this->user('admin')->id,
        ]);
        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => today(),
            'status' => 'absent',
            'recorded_by' => $this->user('admin')->id,
        ]);

        $competition = Competition::create([
            'name' => 'Science Fair ' . uniqid(),
            'slug' => 'science-fair-' . uniqid(),
            'type' => 'hackathon',
            'description' => 'Annual fair.',
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonths(2),
            'status' => 'registration_open',
        ]);
        CompetitionTeam::create([
            'competition_id' => $competition->id,
            'name' => 'Team A',
            'status' => 'registered',
            'leader_student_id' => $student->id,
        ]);
    }

    public function test_analytics_endpoints_require_authentication(): void
    {
        $this->getJson('/api/admin/analytics/overview')->assertStatus(401);
        $this->getJson('/api/admin/analytics/enrollments')->assertStatus(401);
        $this->getJson('/api/admin/analytics/revenue')->assertStatus(401);
        $this->getJson('/api/admin/analytics/attendance')->assertStatus(401);
        $this->getJson('/api/admin/analytics/courses')->assertStatus(401);
        $this->getJson('/api/admin/analytics/teachers')->assertStatus(401);
        $this->getJson('/api/admin/analytics/competitions')->assertStatus(401);
        $this->getJson('/api/admin/analytics/branches')->assertStatus(401);
        $this->getJson('/api/admin/analytics/progress')->assertStatus(401);
    }

    public function test_student_cannot_access_analytics(): void
    {
        $student = $this->user('student');
        Sanctum::actingAs($student, ['*']);

        $this->getJson('/api/admin/analytics/overview')->assertStatus(403);
    }

    public function test_overview_returns_summary_kpis(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/overview')
            ->assertOk()
            ->assertJsonPath('data.total_students', 1)
            ->assertJsonPath('data.total_enrollments', 2)
            ->assertJsonPath('data.completion_rate', 50)
            ->assertJsonPath('data.attendance_rate', 50)
            ->assertJsonPath('data.total_revenue', 400)
            ->assertJsonPath('data.outstanding_fees', 600)
            ->assertJsonPath('data.active_competitions', 1);
    }

    public function test_enrollments_returns_monthly_trends_and_status(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/enrollments')
            ->assertOk()
            ->assertJsonPath('data.total', 2)
            ->assertJsonPath('data.by_status.completed', 1)
            ->assertJsonPath('data.by_status.active', 1);

        $this->assertArrayHasKey('monthly', $this->getJson('/api/admin/analytics/enrollments')->json('data'));
    }

    public function test_revenue_returns_totals_by_method_and_outstanding(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/revenue')
            ->assertOk()
            ->assertJsonPath('data.total', 400)
            ->assertJsonPath('data.by_method.cash', 400)
            ->assertJsonPath('data.outstanding_total', 600);
    }

    public function test_attendance_returns_rate_and_daily_breakdown(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/attendance')
            ->assertOk()
            ->assertJsonPath('data.rate', 50);

        $this->assertArrayHasKey('daily', $this->getJson('/api/admin/analytics/attendance')->json('data'));
    }

    public function test_courses_returns_top_courses_and_completion(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/courses')
            ->assertOk()
            ->assertJsonPath('data.completion_rate', 50)
            ->assertJsonCount(1, 'data.top_courses');
    }

    public function test_teachers_returns_instructor_performance(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/teachers')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_competitions_returns_participation(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/competitions')
            ->assertOk()
            ->assertJsonPath('data.total_competitions', 1)
            ->assertJsonPath('data.total_teams', 1)
            ->assertJsonCount(1, 'data.competitions');
    }

    public function test_branches_returns_per_branch_performance(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/branches')
            ->assertOk()
            ->assertJsonPath('data.total_branches', 1)
            ->assertJsonCount(1, 'data.branches')
            ->assertJsonPath('data.branches.0.branch', 'Main Campus');
    }

    public function test_progress_returns_buckets(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/progress')
            ->assertOk()
            ->assertJsonPath('data.total', 2)
            ->assertJsonPath('data.average_progress', 72.5)
            ->assertJsonPath('data.buckets.100%', 1)
            ->assertJsonPath('data.buckets.26-50%', 1);
    }

    public function test_branch_filter_scopes_students(): void
    {
        $this->seedData();
        $this->student('Nairobi Campus');

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/overview?branch=Nairobi%20Campus')
            ->assertOk()
            ->assertJsonPath('data.total_students', 1);
    }

    public function test_date_filter_scopes_enrollments(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/enrollments?from=' . now()->subDays(2)->toDateString())
            ->assertOk()
            ->assertJsonPath('data.total', 0);
    }

    public function test_filter_options_lists_branches(): void
    {
        $this->seedData();
        $this->student('Nairobi Campus');

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/filter-options')
            ->assertOk()
            ->assertJsonPath('data.branches.0', 'Main Campus')
            ->assertJsonPath('data.branches.1', 'Nairobi Campus');
    }

    public function test_analytics_results_are_cached(): void
    {
        $this->seedData();
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson('/api/admin/analytics/overview')->assertOk();

        $this->assertNotEmpty(Cache::get('analytics:overview:' . md5(json_encode([]))));
    }
}
