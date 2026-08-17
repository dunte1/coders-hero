<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Course;
use App\Models\Employee;
use App\Models\Enrollment;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class DashboardService
{
    public function getAdminDashboard(): array
    {
        return [
            'overview' => [
                'total_users' => User::count(),
                'active_users' => User::active()->count(),
                'total_employees' => Employee::active()->count(),
                'total_courses' => Course::count(),
                'published_courses' => Course::published()->count(),
                'total_enrollments' => Enrollment::count(),
                'active_enrollments' => Enrollment::active()->count(),
                'completed_enrollments' => Enrollment::completed()->count(),
                'total_tasks' => Task::count(),
                'pending_tasks' => Task::where('status', 'pending')->count(),
                'overdue_tasks' => Task::overdue()->count(),
                'total_projects' => Project::count(),
                'active_projects' => Project::active()->count(),
            ],
            'recent_users' => User::latest()->take(5)->with('roles')->get(),
            'recent_enrollments' => Enrollment::latest()->with(['user', 'course'])->take(5)->get(),
            'recent_tasks' => Task::latest()->with(['assigner', 'assignee'])->take(5)->get(),
            'upcoming_announcements' => Announcement::published()
                ->notExpired()
                ->orderByDesc('is_pinned')
                ->take(5)
                ->get(),
            'course_popularity' => Course::published()
                ->withCount('enrollments')
                ->orderByDesc('enrollments_count')
                ->take(5)
                ->get(),
            'enrollment_stats' => [
                'monthly' => Enrollment::where('enrolled_at', '>=', now()->subMonths(12))
                    ->selectRaw('MONTH(enrolled_at) as month, YEAR(enrolled_at) as year, COUNT(*) as count')
                    ->groupBy('year', 'month')
                    ->orderBy('year')
                    ->orderBy('month')
                    ->get(),
            ],
        ];
    }

    public function getInstructorDashboard(string $instructorId): array
    {
        $courses = Course::where('instructor_id', $instructorId);

        return [
            'overview' => [
                'total_courses' => (clone $courses)->count(),
                'published_courses' => (clone $courses)->published()->count(),
                'draft_courses' => (clone $courses)->draft()->count(),
                'total_students' => Enrollment::whereIn('course_id', (clone $courses)->pluck('id'))
                    ->distinct('user_id')
                    ->count(),
                'total_enrollments' => Enrollment::whereIn('course_id', (clone $courses)->pluck('id'))->count(),
                'completed_enrollments' => Enrollment::whereIn('course_id', (clone $courses)->pluck('id'))
                    ->completed()
                    ->count(),
            ],
            'courses' => (clone $courses)
                ->withCount('enrollments')
                ->withCount(['enrollments as completed_count' => function ($q) {
                    $q->where('status', 'completed');
                }])
                ->latest()
                ->take(5)
                ->get(),
            'recent_enrollments' => Enrollment::whereIn('course_id', Course::where('instructor_id', $instructorId)->pluck('id'))
                ->latest()
                ->with(['user', 'course'])
                ->take(10)
                ->get(),
            'pending_tasks' => Task::where('assigned_to', $instructorId)
                ->active()
                ->with('assigner')
                ->take(5)
                ->get(),
        ];
    }

    public function getStudentDashboard(string $userId): array
    {
        $enrollments = Enrollment::where('user_id', $userId);

        return [
            'overview' => [
                'active_courses' => (clone $enrollments)->active()->count(),
                'completed_courses' => (clone $enrollments)->completed()->count(),
                'total_courses' => (clone $enrollments)->count(),
                'average_progress' => round((clone $enrollments)->avg('progress') ?? 0, 2),
                'certificates' => \App\Models\Certificate::where('user_id', $userId)->count(),
            ],
            'active_enrollments' => (clone $enrollments)
                ->active()
                ->with(['course', 'course.category', 'course.instructor'])
                ->orderByDesc('enrolled_at')
                ->take(5)
                ->get(),
            'recent_completions' => Enrollment::where('user_id', $userId)
                ->completed()
                ->with(['course', 'certificate'])
                ->orderByDesc('completed_at')
                ->take(5)
                ->get(),
            'recommended_courses' => \App\Models\Course::published()
                ->whereDoesntHave('enrollments', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->with(['category', 'instructor'])
                ->take(5)
                ->get(),
            'upcoming_tasks' => Task::where('assigned_to', $userId)
                ->active()
                ->orderBy('due_date')
                ->take(5)
                ->get(),
        ];
    }

    public function getEmployeeDashboard(string $userId): array
    {
        $employee = Employee::where('user_id', $userId)->with(['department', 'position'])->first();

        return [
            'overview' => [
                'pending_tasks' => Task::where('assigned_to', $userId)->active()->count(),
                'completed_tasks' => Task::where('assigned_to', $userId)->byStatus('completed')->count(),
                'overdue_tasks' => Task::where('assigned_to', $userId)->overdue()->count(),
                'active_courses' => Enrollment::where('user_id', $userId)->active()->count(),
                'projects' => Project::whereHas('members', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->active()->count(),
            ],
            'employee' => $employee,
            'my_tasks' => Task::where('assigned_to', $userId)
                ->active()
                ->orderBy('due_date')
                ->take(10)
                ->get(),
            'my_projects' => Project::whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })->with(['owner', 'members.user'])
                ->active()
                ->take(5)
                ->get(),
            'my_courses' => Enrollment::where('user_id', $userId)
                ->active()
                ->with(['course', 'course.category'])
                ->take(5)
                ->get(),
            'recent_announcements' => Announcement::published()
                ->notExpired()
                ->take(5)
                ->get(),
        ];
    }
}
