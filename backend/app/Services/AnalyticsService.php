<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Competition;
use App\Models\CompetitionTeam;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /** Cache analytics results for 5 minutes. */
    private const TTL = 300;

    private function cacheKey(string $section, array $filters): string
    {
        return 'analytics:' . $section . ':' . md5(json_encode($filters));
    }

    private function remember(string $section, array $filters, callable $callback)
    {
        return Cache::remember($this->cacheKey($section, $filters), self::TTL, $callback);
    }

    private function from(array $filters): ?Carbon
    {
        return ! empty($filters['from']) ? Carbon::parse($filters['from'])->startOfDay() : null;
    }

    private function to(array $filters): ?Carbon
    {
        return ! empty($filters['to']) ? Carbon::parse($filters['to'])->endOfDay() : null;
    }

    /** Student ids at a branch (or [] when no branch filter). */
    private function branchStudentIds(?string $branch): array
    {
        if (! $branch || $branch === 'all') {
            return [];
        }

        return Student::where('branch', $branch)->pluck('id')->all();
    }

    /** SQL that formats a column as "YYYY-MM" on the active driver (MySQL vs SQLite). */
    private function monthExpr(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }

    /** User ids at a branch (for enrollment filters, which join via users). */
    private function branchUserIds(?string $branch): array
    {
        if (! $branch || $branch === 'all') {
            return [];
        }

        return Student::where('branch', $branch)->whereNotNull('user_id')->pluck('user_id')->all();
    }

    // ---- Overview ----

    public function overview(array $filters = []): array
    {
        return $this->remember('overview', $filters, function () use ($filters) {
            $from = $this->from($filters);
            $to = $this->to($filters);
            $branch = $filters['branch'] ?? null;
            $studentIds = $this->branchStudentIds($branch);
            $userIds = $this->branchUserIds($branch);

            $studentsQuery = Student::query();
            if ($studentIds) {
                $studentsQuery->whereIn('id', $studentIds);
            }
            $totalStudents = (clone $studentsQuery)->count();
            $activeStudents = (clone $studentsQuery)->where('status', 'active')->count();

            $revenueQuery = Payment::query();
            if ($from) $revenueQuery->whereDate('paid_at', '>=', $from);
            if ($to) $revenueQuery->whereDate('paid_at', '<=', $to);
            if ($studentIds) {
                $revenueQuery->whereHas('invoice', fn ($q) => $q->whereIn('student_id', $studentIds));
            }
            $totalRevenue = (clone $revenueQuery)->sum('amount');

            $outstandingQuery = Invoice::query()->whereIn('status', ['issued', 'partial', 'overdue']);
            if ($studentIds) {
                $outstandingQuery->whereIn('student_id', $studentIds);
            }
            $outstandingFees = (clone $outstandingQuery)
                ->selectRaw('COALESCE(SUM(amount - paid_amount), 0) as total')
                ->value('total');

            $enrollmentsQuery = Enrollment::query();
            if ($from) $enrollmentsQuery->whereDate('enrolled_at', '>=', $from);
            if ($to) $enrollmentsQuery->whereDate('enrolled_at', '<=', $to);
            if ($userIds) {
                $enrollmentsQuery->whereIn('user_id', $userIds);
            }
            $totalEnrollments = (clone $enrollmentsQuery)->count();
            $completedEnrollments = (clone $enrollmentsQuery)->where('status', 'completed')->count();

            $attendanceQuery = Attendance::query();
            if ($from) $attendanceQuery->whereDate('attendance_date', '>=', $from);
            if ($to) $attendanceQuery->whereDate('attendance_date', '<=', $to);
            if ($studentIds) {
                $attendanceQuery->whereIn('student_id', $studentIds);
            }
            $totalAttendance = (clone $attendanceQuery)->count();
            $presentAttendance = (clone $attendanceQuery)->whereIn('status', ['present', 'late'])->count();

            $competitions = Competition::whereIn('status', ['registration_open', 'ongoing'])->count();

            return [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'total_revenue' => round((float) $totalRevenue, 2),
                'outstanding_fees' => round((float) $outstandingFees, 2),
                'total_enrollments' => $totalEnrollments,
                'completion_rate' => $totalEnrollments > 0 ? round(($completedEnrollments / $totalEnrollments) * 100, 1) : 0,
                'attendance_rate' => $totalAttendance > 0 ? round(($presentAttendance / $totalAttendance) * 100, 1) : 0,
                'active_competitions' => $competitions,
                'total_courses' => Course::count(),
            ];
        });
    }

    // ---- Enrollment analytics ----

    public function enrollments(array $filters = []): array
    {
        return $this->remember('enrollments', $filters, function () use ($filters) {
            $from = $this->from($filters) ?? now()->subMonths(11)->startOfMonth();
            $to = $this->to($filters) ?? now();
            $userIds = $this->branchUserIds($filters['branch'] ?? null);

            $monthExpr = $this->monthExpr('enrolled_at');
            $monthly = Enrollment::query()
                ->when($userIds, fn ($q) => $q->whereIn('user_id', $userIds))
                ->whereBetween('enrolled_at', [$from, $to])
                ->selectRaw("{$monthExpr} as month, COUNT(*) as count")
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('count', 'month');

            $byStatus = Enrollment::query()
                ->when($userIds, fn ($q) => $q->whereIn('user_id', $userIds))
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            // Enrollments per grade, via each student's user account.
            $gradeUserIds = Student::query()
                ->when($userIds, fn ($q) => $q->whereIn('user_id', $userIds))
                ->whereNotNull('user_id')
                ->get(['user_id', 'grade']);

            $countsByUser = Enrollment::whereIn('user_id', $gradeUserIds->pluck('user_id'))
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->pluck('count', 'user_id');

            $byGrade = $gradeUserIds
                ->groupBy(fn ($s) => $s->grade ?? 'No grade')
                ->map(function ($group) use ($countsByUser) {
                    return [
                        'students' => $group->count(),
                        'enrollments' => (int) $group->sum(fn ($s) => (int) ($countsByUser[$s->user_id] ?? 0)),
                    ];
                });

            return [
                'total' => (int) $monthly->sum(),
                'monthly' => $monthly,
                'by_status' => $byStatus,
                'by_grade' => $byGrade,
            ];
        });
    }

    // ---- Revenue analytics ----

    public function revenue(array $filters = []): array
    {
        return $this->remember('revenue', $filters, function () use ($filters) {
            $from = $this->from($filters) ?? now()->subMonths(11)->startOfMonth();
            $to = $this->to($filters) ?? now();
            $studentIds = $this->branchStudentIds($filters['branch'] ?? null);

            $monthExpr = $this->monthExpr('paid_at');
            $monthly = Payment::query()
                ->when($studentIds, fn ($q) => $q->whereHas('invoice', fn ($sub) => $sub->whereIn('student_id', $studentIds)))
                ->whereBetween('paid_at', [$from, $to])
                ->selectRaw("{$monthExpr} as month, SUM(amount) as total")
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month')
                ->map(fn ($v) => round((float) $v, 2));

            $byMethod = Payment::query()
                ->when($studentIds, fn ($q) => $q->whereHas('invoice', fn ($sub) => $sub->whereIn('student_id', $studentIds)))
                ->selectRaw('method, SUM(amount) as total')
                ->groupBy('method')
                ->pluck('total', 'method')
                ->map(fn ($v) => round((float) $v, 2));

            $outstanding = Invoice::query()
                ->when($studentIds, fn ($q) => $q->whereIn('student_id', $studentIds))
                ->whereIn('status', ['issued', 'partial', 'overdue'])
                ->selectRaw('status, COALESCE(SUM(amount - paid_amount), 0) as total')
                ->groupBy('status')
                ->pluck('total', 'status')
                ->map(fn ($v) => round((float) $v, 2));

            return [
                'total' => round((float) $monthly->sum(), 2),
                'monthly' => $monthly,
                'by_method' => $byMethod,
                'outstanding' => $outstanding,
                'outstanding_total' => round((float) $outstanding->sum(), 2),
            ];
        });
    }

    // ---- Attendance analytics ----

    public function attendance(array $filters = []): array
    {
        return $this->remember('attendance', $filters, function () use ($filters) {
            $from = $this->from($filters) ?? now()->subDays(29);
            $to = $this->to($filters) ?? now();
            $studentIds = $this->branchStudentIds($filters['branch'] ?? null);

            $daily = Attendance::query()
                ->when($studentIds, fn ($q) => $q->whereIn('student_id', $studentIds))
                ->whereBetween('attendance_date', [$from, $to])
                ->selectRaw('attendance_date, COUNT(*) as total, SUM(CASE WHEN status IN ("present", "late") THEN 1 ELSE 0 END) as present')
                ->groupBy('attendance_date')
                ->orderBy('attendance_date')
                ->get()
                ->map(fn ($row) => [
                    'date' => (string) $row->attendance_date,
                    'total' => (int) $row->total,
                    'present' => (int) $row->present,
                    'rate' => $row->total > 0 ? round(((int) $row->present / (int) $row->total) * 100, 1) : 0,
                ]);

            $byStatus = Attendance::query()
                ->when($studentIds, fn ($q) => $q->whereIn('student_id', $studentIds))
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            $total = (int) $byStatus->sum();
            $present = ($byStatus['present'] ?? 0) + ($byStatus['late'] ?? 0);

            return [
                'rate' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
                'daily' => $daily,
                'by_status' => $byStatus,
            ];
        });
    }

    // ---- Course completion ----

    public function courses(array $filters = []): array
    {
        return $this->remember('courses', $filters, function () use ($filters) {
            $userIds = $this->branchUserIds($filters['branch'] ?? null);

            $topCourses = Course::withCount(['enrollments as completed_count' => fn ($q) => $q->where('status', 'completed')])
                ->withCount('enrollments')
                ->orderByDesc('enrollments_count')
                ->take(10)
                ->get()
                ->map(fn (Course $c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                    'enrollments' => $c->enrollments_count,
                    'completed' => $c->completed_count,
                    'completion_rate' => $c->enrollments_count > 0
                        ? round(($c->completed_count / $c->enrollments_count) * 100, 1)
                        : 0,
                ]);

            $totalEnrollments = Enrollment::when($userIds, fn ($q) => $q->whereIn('user_id', $userIds))->count();
            $completed = Enrollment::when($userIds, fn ($q) => $q->whereIn('user_id', $userIds))->where('status', 'completed')->count();

            return [
                'completion_rate' => $totalEnrollments > 0 ? round(($completed / $totalEnrollments) * 100, 1) : 0,
                'total_enrollments' => $totalEnrollments,
                'completed' => $completed,
                'top_courses' => $topCourses,
            ];
        });
    }

    // ---- Teacher performance ----

    public function teachers(array $filters = []): array
    {
        return $this->remember('teachers', $filters, function () {
            $instructorIds = Course::whereNotNull('instructor_id')->distinct()->pluck('instructor_id');

            return User::whereIn('id', $instructorIds)
                ->get()
                ->map(function (User $u) {
                    $courses = Course::where('instructor_id', $u->id)->get();
                    $enrollments = 0;
                    $completed = 0;
                    foreach ($courses as $course) {
                        $enrollments += $course->enrollments()->count();
                        $completed += $course->enrollments()->where('status', 'completed')->count();
                    }

                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'courses' => $courses->count(),
                        'enrollments' => $enrollments,
                        'completed' => $completed,
                        'completion_rate' => $enrollments > 0 ? round(($completed / $enrollments) * 100, 1) : 0,
                    ];
                })
                ->sortByDesc('enrollments')
                ->values()
                ->take(10)
                ->all();
        });
    }

    // ---- Competition participation ----

    public function competitions(array $filters = []): array
    {
        return $this->remember('competitions', $filters, function () {
            $competitions = Competition::withCount('teams')
                ->orderBy('start_date')
                ->get()
                ->map(fn (Competition $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'type' => $c->type,
                    'status' => $c->status,
                    'teams' => $c->teams_count,
                    'participants' => $c->teams()->withCount('members')->get()->sum('members_count'),
                ]);

            $byStatus = CompetitionTeam::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status');

            $byType = Competition::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type');

            return [
                'total_competitions' => Competition::count(),
                'total_teams' => CompetitionTeam::count(),
                'competitions' => $competitions,
                'by_status' => $byStatus,
                'by_type' => $byType,
            ];
        });
    }

    // ---- Branch performance ----

    public function branches(array $filters = []): array
    {
        return $this->remember('branches', $filters, function () use ($filters) {
            $from = $this->from($filters) ?? now()->subMonths(11)->startOfMonth();
            $to = $this->to($filters) ?? now();

            $rows = Student::selectRaw('COALESCE(branch, "Unknown") as branch, COUNT(*) as total, SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active')
                ->groupBy('branch')
                ->orderByDesc('total')
                ->get()
                ->map(function ($row) use ($from, $to) {
                    $branch = $row->branch;
                    $studentIds = Student::where('branch', $branch)->pluck('id');

                    $revenue = Payment::whereHas('invoice', fn ($q) => $q->whereIn('student_id', $studentIds))
                        ->whereBetween('paid_at', [$from, $to])
                        ->sum('amount');

                    $attendance = Attendance::whereIn('student_id', $studentIds)->count();
                    $present = Attendance::whereIn('student_id', $studentIds)->whereIn('status', ['present', 'late'])->count();

                    return [
                        'branch' => $branch,
                        'students' => (int) $row->total,
                        'active' => (int) $row->active,
                        'revenue' => round((float) $revenue, 2),
                        'attendance_rate' => $attendance > 0 ? round(($present / $attendance) * 100, 1) : 0,
                    ];
                });

            return [
                'branches' => $rows,
                'total_branches' => Student::whereNotNull('branch')->distinct()->count('branch'),
            ];
        });
    }

    // ---- Student progress ----

    public function progress(array $filters = []): array
    {
        return $this->remember('progress', $filters, function () use ($filters) {
            $userIds = $this->branchUserIds($filters['branch'] ?? null);

            $enrollments = Enrollment::query()
                ->when($userIds, fn ($q) => $q->whereIn('user_id', $userIds))
                ->get(['status', 'progress']);

            $buckets = [
                '0-25%' => 0,
                '26-50%' => 0,
                '51-75%' => 0,
                '76-99%' => 0,
                '100%' => 0,
            ];

            foreach ($enrollments as $e) {
                $p = (float) $e->progress;
                if ($p >= 100) $buckets['100%']++;
                elseif ($p >= 76) $buckets['76-99%']++;
                elseif ($p >= 51) $buckets['51-75%']++;
                elseif ($p >= 26) $buckets['26-50%']++;
                else $buckets['0-25%']++;
            }

            return [
                'total' => $enrollments->count(),
                'completed' => $enrollments->where('status', 'completed')->count(),
                'average_progress' => round((float) $enrollments->avg('progress'), 1),
                'buckets' => $buckets,
            ];
        });
    }

    // ---- Filters ----

    public function filterOptions(): array
    {
        return $this->remember('filter_options', [], function () {
            return [
                'branches' => Student::whereNotNull('branch')
                    ->distinct()
                    ->orderBy('branch')
                    ->pluck('branch')
                    ->all(),
            ];
        });
    }
}
