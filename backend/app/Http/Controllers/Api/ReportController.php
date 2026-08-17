<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\ActivityLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    use ApiResponse;

    public function userReport(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $activeUsers = User::active()->count();
        $inactiveUsers = User::inactive()->count();
        $newUsersThisMonth = User::where('created_at', '>=', now()->startOfMonth())->count();
        $newUsersLastMonth = User::where('created_at', '>=', now()->subMonth()->startOfMonth())
            ->where('created_at', '<', now()->startOfMonth())
            ->count();

        $usersByRole = User::withCount('roles')
            ->get()
            ->groupBy(fn ($user) => $user->roles->first()->name ?? 'no_role')
            ->map(fn ($group) => $group->count());

        $recentUsers = User::latest()->take(10)->with('roles')->get();

        return $this->successResponse([
            'overview' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'inactive' => $inactiveUsers,
                'new_this_month' => $newUsersThisMonth,
                'growth_rate' => $newUsersLastMonth > 0
                    ? round((($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100, 2)
                    : 0,
            ],
            'by_role' => $usersByRole,
            'recent_users' => $recentUsers,
        ], 'User report generated successfully.');
    }

    public function courseReport(Request $request): JsonResponse
    {
        $totalCourses = Course::count();
        $publishedCourses = Course::published()->count();
        $draftCourses = Course::draft()->count();
        $archivedCourses = Course::archived()->count();
        $totalRevenue = Enrollment::sum('progress')->count() * 0;

        $coursesByCategory = Course::withCount('enrollments')
            ->with('category')
            ->get()
            ->groupBy(fn ($course) => $course->category->name ?? 'Uncategorized')
            ->map(fn ($group) => [
                'count' => $group->count(),
                'total_enrollments' => $group->sum('enrollments_count'),
            ]);

        $topCourses = Course::published()
            ->withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->take(10)
            ->get();

        $coursesByLevel = Course::selectRaw('level, COUNT(*) as count')
            ->groupBy('level')
            ->get()
            ->pluck('count', 'level');

        return $this->successResponse([
            'overview' => [
                'total' => $totalCourses,
                'published' => $publishedCourses,
                'draft' => $draftCourses,
                'archived' => $archivedCourses,
            ],
            'by_category' => $coursesByCategory,
            'by_level' => $coursesByLevel,
            'top_courses' => $topCourses,
        ], 'Course report generated successfully.');
    }

    public function enrollmentReport(Request $request): JsonResponse
    {
        $totalEnrollments = Enrollment::count();
        $activeEnrollments = Enrollment::active()->count();
        $completedEnrollments = Enrollment::completed()->count();
        $averageProgress = round(Enrollment::avg('progress') ?? 0, 2);

        $monthlyEnrollments = Enrollment::where('enrolled_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(enrolled_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $completionRate = $totalEnrollments > 0
            ? round(($completedEnrollments / $totalEnrollments) * 100, 2)
            : 0;

        $enrollmentsByStatus = Enrollment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        return $this->successResponse([
            'overview' => [
                'total' => $totalEnrollments,
                'active' => $activeEnrollments,
                'completed' => $completedEnrollments,
                'average_progress' => $averageProgress,
                'completion_rate' => $completionRate,
            ],
            'by_status' => $enrollmentsByStatus,
            'monthly' => $monthlyEnrollments,
        ], 'Enrollment report generated successfully.');
    }

    public function activityReport(Request $request): JsonResponse
    {
        $totalActivities = ActivityLog::count();
        $todayActivities = ActivityLog::whereDate('created_at', today())->count();
        $weekActivities = ActivityLog::where('created_at', '>=', now()->startOfWeek())->count();

        $recentActivities = ActivityLog::latest()
            ->with('subject')
            ->take(50)
            ->get();

        $activitiesByEvent = ActivityLog::selectRaw('event, COUNT(*) as count')
            ->groupBy('event')
            ->get()
            ->pluck('count', 'event');

        $activitiesByDay = ActivityLog::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as day, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return $this->successResponse([
            'overview' => [
                'total' => $totalActivities,
                'today' => $todayActivities,
                'this_week' => $weekActivities,
            ],
            'by_event' => $activitiesByEvent,
            'by_day' => $activitiesByDay,
            'recent' => $recentActivities,
        ], 'Activity report generated successfully.');
    }
}
