<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\CalendarEvent;
use App\Models\Category;
use App\Models\Competition;
use App\Models\CompetitionTeam;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Fee;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Task;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_admin_dashboard_returns_live_metrics(): void
    {
        $admin = User::factory()->create()->assignRole('admin');
        Sanctum::actingAs($admin);

        $instructor = User::factory()->create()->assignRole('instructor');
        $studentUser = User::factory()->create()->assignRole('student');

        $category = Category::create(['name' => 'Web Development', 'slug' => 'web-development']);
        $course = Course::create([
            'title' => 'Laravel 12 Masterclass',
            'slug' => 'laravel-12-masterclass',
            'description' => 'Learn Laravel.',
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'level' => 'beginner',
            'duration_hours' => 10,
            'price' => 99.99,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $student = Student::create([
            'student_id' => 'STU-TEST-1',
            'user_id' => $studentUser->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'gender' => 'female',
            'status' => 'active',
        ]);

        Branch::create(['name' => 'Main Campus', 'code' => 'MC', 'is_active' => true]);

        Enrollment::create([
            'user_id' => $studentUser->id,
            'course_id' => $course->id,
            'status' => 'completed',
            'enrolled_at' => now()->subMonths(2),
            'completed_at' => now()->subMonth(),
            'progress' => 100,
        ]);

        $fee = Fee::create([
            'student_id' => $student->id,
            'label' => 'Tuition',
            'amount' => 500.00,
            'due_date' => now()->addMonth(),
            'status' => 'pending',
        ]);

        Payment::create([
            'fee_id' => $fee->id,
            'receipt_no' => 'RCP-TEST-1',
            'amount' => 1000.00,
            'method' => 'cash',
            'paid_at' => now(),
        ]);

        $competition = Competition::create([
            'name' => 'Hackathon 2026',
            'slug' => 'hackathon-2026',
            'status' => 'registration_open',
        ]);

        CompetitionTeam::create([
            'competition_id' => $competition->id,
            'name' => 'Team A',
            'status' => 'registered',
        ]);

        CalendarEvent::create([
            'user_id' => $admin->id,
            'title' => 'Open Day',
            'event_type' => 'activity',
            'starts_at' => now()->addDays(3),
            'ends_at' => now()->addDays(3)->addHours(2),
        ]);

        Task::create([
            'title' => 'Submit report',
            'assigned_to' => $admin->id,
            'assigned_by' => $admin->id,
            'priority' => 'high',
            'status' => 'pending',
            'due_date' => now()->addDays(2),
        ]);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.overview.total_students', 1)
            ->assertJsonPath('data.overview.total_teachers', 0)
            ->assertJsonPath('data.overview.active_schools', 1)
            ->assertJsonPath('data.overview.revenue', 1000)
            ->assertJsonPath('data.overview.outstanding_fees', 500)
            ->assertJsonPath('data.overview.competition_registrations', 1)
            ->assertJsonStructure([
                'data' => [
                    'overview' => [
                        'total_students',
                        'total_teachers',
                        'active_schools',
                        'revenue',
                        'outstanding_fees',
                        'competition_registrations',
                        'completion_rate',
                        'attendance_summary' => ['date', 'present', 'late', 'absent', 'total'],
                        'ai_interactions_30d',
                    ],
                    'recent_activity',
                    'upcoming_tasks',
                    'upcoming_events',
                    'enrollment_stats' => ['monthly'],
                    'completion_stats' => ['monthly'],
                    'unread_notifications',
                ],
            ]);
    }

    public function test_admin_dashboard_returns_upcoming_events_and_tasks(): void
    {
        $admin = User::factory()->create()->assignRole('admin');
        Sanctum::actingAs($admin);

        CalendarEvent::create([
            'user_id' => $admin->id,
            'title' => 'Parent Meeting',
            'event_type' => 'meeting',
            'starts_at' => now()->addWeek(),
            'ends_at' => now()->addWeek()->addHour(),
            'location' => 'Hall A',
        ]);

        Task::create([
            'title' => 'Review budget',
            'assigned_to' => $admin->id,
            'assigned_by' => $admin->id,
            'priority' => 'medium',
            'status' => 'pending',
            'due_date' => now()->addDays(4),
        ]);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.upcoming_events.0.title', 'Parent Meeting')
            ->assertJsonPath('data.upcoming_tasks.0.title', 'Review budget');
    }

    public function test_student_dashboard_returns_student_overview(): void
    {
        $student = User::factory()->create()->assignRole('student');
        Sanctum::actingAs($student);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'overview' => [
                        'active_courses',
                        'completed_courses',
                        'average_progress',
                        'certificates',
                    ],
                ],
            ]);
    }
}
