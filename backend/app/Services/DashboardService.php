<?php

namespace App\Services;

use App\Http\Resources\NotificationResource;
use App\Models\AiAssistant;
use App\Models\AiConversation;
use App\Models\AiUsageLog;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Branch;
use App\Models\CalendarEvent;
use App\Models\CompetitionTeam;
use App\Models\Course;
use App\Models\Employee;
use App\Models\Enrollment;
use App\Models\Fee;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Student;
use App\Models\Task;
use App\Models\User;

class DashboardService
{
    public function getAdminDashboard(?string $userId = null): array
    {
        $totalEnrollments = Enrollment::count();
        $completedEnrollments = Enrollment::completed()->count();

        $attendanceToday = Attendance::whereDate('attendance_date', now()->toDateString())->get();

        return [
            'overview' => [
                'total_users' => User::count(),
                'active_users' => User::active()->count(),
                'total_employees' => Employee::active()->count(),
                'total_courses' => Course::count(),
                'published_courses' => Course::published()->count(),
                'total_enrollments' => $totalEnrollments,
                'active_enrollments' => Enrollment::active()->count(),
                'completed_enrollments' => $completedEnrollments,
                'total_tasks' => Task::count(),
                'pending_tasks' => Task::where('status', 'pending')->count(),
                'overdue_tasks' => Task::overdue()->count(),
                'total_projects' => Project::count(),
                'active_projects' => Project::active()->count(),
                // School / SIS
                'total_students' => Student::count(),
                'total_teachers' => User::role('teacher')->count(),
                'active_schools' => Branch::active()->count(),
                // Finance
                'revenue' => round((float) Payment::where('created_at', '>=', now()->startOfMonth())->sum('amount'), 2),
                'outstanding_fees' => round((float) Fee::whereNot('status', 'paid')->sum('amount'), 2),
                // Competitions
                'competition_registrations' => CompetitionTeam::count(),
                // Learning
                'completion_rate' => $totalEnrollments > 0
                    ? round(($completedEnrollments / $totalEnrollments) * 100, 1)
                    : 0,
                // Attendance
                'attendance_summary' => [
                    'date' => now()->toDateString(),
                    'present' => $attendanceToday->where('status', 'present')->count(),
                    'late' => $attendanceToday->where('status', 'late')->count(),
                    'absent' => $attendanceToday->where('status', 'absent')->count(),
                    'total' => $attendanceToday->count(),
                ],
                // AI
                'ai_insights' => $this->buildAiInsights(),
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
                'monthly' => $this->monthlyStats(
                    Enrollment::where('enrolled_at', '>=', now()->subMonths(12))->select('enrolled_at'),
                    'enrolled_at'
                ),
            ],
            'completion_stats' => [
                'monthly' => $this->monthlyStats(
                    Enrollment::completed()
                        ->where('completed_at', '>=', now()->subMonths(12))
                        ->select('completed_at'),
                    'completed_at'
                ),
            ],
            'recent_activity' => $this->buildRecentActivity(),
            'upcoming_tasks' => Task::active()
                ->whereNotNull('due_date')
                ->orderBy('due_date')
                ->take(5)
                ->get(['id', 'title', 'due_date', 'priority', 'status']),
            'upcoming_events' => CalendarEvent::where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->take(5)
                ->get(['id', 'title', 'event_type', 'starts_at', 'location', 'color']),
            'recent_notifications' => $userId
                ? NotificationResource::collection(
                    Notification::forUser($userId)->latest()->take(5)->get()
                )
                : collect(),
            'unread_notifications' => $userId
                ? Notification::forUser($userId)->unread()->count()
                : 0,
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

    /**
     * Combine the latest users, enrollments, tasks and announcements into a
     * single normalized activity feed for the admin dashboard.
     */
    private function buildRecentActivity(): \Illuminate\Support\Collection
    {
        $recentUsers = User::latest()->take(5)->get()->map(function (User $user) {
            return [
                'type' => 'user_joined',
                'message' => 'joined the platform',
                'user' => $this->activityUser($user),
                'timestamp' => $user->created_at?->toISOString(),
            ];
        });

        $recentEnrollments = Enrollment::latest()->with(['user', 'course'])->take(5)->get()->map(function (Enrollment $enrollment) {
            return [
                'type' => 'enrollment',
                'message' => 'enrolled in ' . ($enrollment->course?->title ?? 'a course'),
                'user' => $this->activityUser($enrollment->user),
                'timestamp' => $enrollment->enrolled_at?->toISOString(),
            ];
        });

        $recentTasks = Task::latest()->with(['assigner', 'assignee'])->take(5)->get()->map(function (Task $task) {
            return [
                'type' => 'task',
                'message' => 'created task "' . $task->title . '"',
                'user' => $this->activityUser($task->assigner ?? $task->assignee),
                'timestamp' => $task->created_at?->toISOString(),
            ];
        });

        $recentAnnouncements = Announcement::published()
            ->latest()
            ->with('author')
            ->take(5)
            ->get()
            ->map(function (Announcement $announcement) {
                return [
                    'type' => 'announcement',
                    'message' => 'posted "' . $announcement->title . '"',
                    'user' => $this->activityUser($announcement->author),
                    'timestamp' => $announcement->created_at?->toISOString(),
                ];
            });

        return $recentUsers
            ->concat($recentEnrollments)
            ->concat($recentTasks)
            ->concat($recentAnnouncements)
            ->filter(fn (array $item) => $item['timestamp'] !== null)
            ->sortByDesc('timestamp')
            ->take(8)
            ->values();
    }

    /**
     * Group rows by year-month in PHP so the monthly stats work on both
     * MySQL and SQLite (avoids DB-specific SQL functions).
     */
    private function monthlyStats($query, string $dateColumn): \Illuminate\Support\Collection
    {
        return $query->get()
            ->groupBy(fn ($row) => $row->{$dateColumn}->format('Y-m'))
            ->map(fn ($group, string $key) => [
                'year' => (int) substr($key, 0, 4),
                'month' => (int) substr($key, 5, 2),
                'count' => $group->count(),
            ])
            ->values();
    }

    private function buildAiInsights(): array
    {
        $now = now();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        $usageLogs = AiUsageLog::where('ai_usage_logs.created_at', '>=', $thirtyDaysAgo);
        $totalInteractions = (clone $usageLogs)->count();
        $totalTokens = (clone $usageLogs)->sum('total_tokens');
        $totalCost = round((float) (clone $usageLogs)->sum('cost'), 4);

        $topAssistant = AiUsageLog::where('ai_usage_logs.created_at', '>=', $thirtyDaysAgo)
            ->join('ai_assistants', 'ai_usage_logs.assistant_id', '=', 'ai_assistants.id')
            ->selectRaw('ai_assistants.name, count(*) as usage_count')
            ->groupBy('ai_assistants.name')
            ->orderByDesc('usage_count')
            ->value('name');

        $activeConversations = AiConversation::where('ai_conversations.created_at', '>=', $thirtyDaysAgo)->count();
        $uniqueUsers = AiUsageLog::where('ai_usage_logs.created_at', '>=', $thirtyDaysAgo)->distinct('user_id')->count('user_id');

        return [
            'total_interactions_30d' => $totalInteractions,
            'total_tokens_30d' => $totalTokens,
            'total_cost_30d' => $totalCost,
            'avg_tokens_per_interaction' => $totalInteractions > 0 ? round($totalTokens / $totalInteractions) : 0,
            'top_assistant' => $topAssistant,
            'active_conversations_30d' => $activeConversations,
            'unique_users_30d' => $uniqueUsers,
        ];
    }

    /**
     * Normalize a user into the { first_name, last_name, avatar } shape the
     * dashboard activity feed expects (User stores a single `name` column).
     */
    private function activityUser(?User $user): array
    {
        if (! $user) {
            return ['first_name' => 'System', 'last_name' => '', 'avatar' => null];
        }

        $parts = preg_split('/\s+/', trim($user->name ?? '')) ?: [];

        return [
            'first_name' => $parts[0] ?? '',
            'last_name' => count($parts) > 1 ? implode(' ', array_slice($parts, 1)) : '',
            'avatar' => $user->avatar,
        ];
    }
}
