<?php

namespace App\Services\Teachers;

use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\SchoolClass;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TeacherAnalyticsService
{
    public function overview(string $teacherUserId): array
    {
        $classIds = SchoolClass::byTeacher($teacherUserId)->pluck('id');

        $assignmentTotals = Assignment::query()
            ->byTeacher($teacherUserId)
            ->select(
                DB::raw('count(*) as total'),
                DB::raw("sum(case when status = 'published' then 1 else 0 end) as published"),
            )
            ->first();

        $examTotals = Exam::query()
            ->byTeacher($teacherUserId)
            ->count();

        $recent = Assignment::query()
            ->byTeacher($teacherUserId)
            ->withCount('submissions')
            ->where('status', 'published')
            ->orderByDesc('due_at')
            ->take(5)
            ->get();

        $gradedCount = DB::table('assignment_submissions')
            ->whereIn('assignment_id', Assignment::byTeacher($teacherUserId)->pluck('id'))
            ->where('status', 'graded')
            ->count();

        $submittedCount = DB::table('assignment_submissions')
            ->whereIn('assignment_id', Assignment::byTeacher($teacherUserId)->pluck('id'))
            ->whereIn('status', ['submitted', 'graded'])
            ->count();

        return [
            'classes_count' => SchoolClass::byTeacher($teacherUserId)->count(),
            'students_count' => SchoolClass::byTeacher($teacherUserId)
                ->withCount('students')->get()->sum('students_count'),
            'assignments_count' => $assignmentTotals->total ?? 0,
            'published_assignments' => $assignmentTotals->published ?? 0,
            'exams_count' => $examTotals,
            'submissions' => $submittedCount,
            'graded_submissions' => $gradedCount,
            'completion_rate' => $submittedCount > 0 ? round(($gradedCount / $submittedCount) * 100, 1) : 0,
            'recent_assignments' => $recent,
        ];
    }

    public function attendanceTrend(string $teacherUserId, int $days = 30): array
    {
        $from = Carbon::now()->subDays($days - 1)->startOfDay();
        $to = Carbon::now()->endOfDay();

        $classIds = SchoolClass::byTeacher($teacherUserId)->pluck('id');
        $studentIds = DB::table('class_student')->whereIn('class_id', $classIds)->pluck('student_id');

        $rows = Attendance::query()
            ->whereIn('student_id', $studentIds)
            ->whereDate('attendance_date', '>=', $from->toDateString())
            ->whereDate('attendance_date', '<=', $to->toDateString())
            ->select('attendance_date', 'status', DB::raw('count(*) as count'))
            ->groupBy('attendance_date', 'status')
            ->orderBy('attendance_date')
            ->get();

        $trend = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $dayRows = $rows->where('attendance_date', $date);
            $total = $dayRows->sum('count');

            $trend[] = [
                'date' => $date,
                'present' => $dayRows->whereIn('status', ['present', 'late'])->sum('count'),
                'absent' => $dayRows->where('status', 'absent')->sum('count'),
                'late' => $dayRows->where('status', 'late')->sum('count'),
                'excused' => $dayRows->where('status', 'excused')->sum('count'),
                'rate' => $total > 0
                    ? round(($dayRows->whereIn('status', ['present', 'late'])->sum('count') / $total) * 100, 1)
                    : 0,
            ];
        }

        return $trend;
    }

    public function gradeDistribution(string $teacherUserId, ?int $classId = null): array
    {
        $query = DB::table('gradebook_entries')
            ->where('teacher_user_id', $teacherUserId);

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $entries = $query->select('student_id', DB::raw('sum(score) as score'), DB::raw('sum(max_score) as max_score'))
            ->groupBy('student_id')
            ->get();

        $distribution = [
            'A' => 0, 'B' => 0, 'C' => 0, 'D' => 0, 'F' => 0, 'ungraded' => 0,
        ];

        foreach ($entries as $entry) {
            if (!$entry->max_score || $entry->max_score <= 0) {
                $distribution['ungraded']++;
                continue;
            }

            $percentage = ($entry->score / $entry->max_score) * 100;

            $grade = match (true) {
                $percentage >= 80 => 'A',
                $percentage >= 70 => 'B',
                $percentage >= 60 => 'C',
                $percentage >= 50 => 'D',
                default => 'F',
            };

            $distribution[$grade]++;
        }

        return $distribution;
    }

    public function classPerformance(string $teacherUserId, ?int $classId = null): array
    {
        $classes = SchoolClass::byTeacher($teacherUserId)
            ->withCount('students')
            ->when($classId, fn ($q) => $q->where('id', $classId))
            ->get();

        return $classes->map(function (SchoolClass $class) {
            $entries = $class->gradebookEntries;

            $totalWeight = 0;
            $weightedScore = 0;

            foreach ($entries->groupBy('student_id') as $studentEntries) {
                $studentWeight = 0;
                $studentScore = 0;
                foreach ($studentEntries->groupBy('component') as $componentItems) {
                    $componentWeight = $componentItems->first()?->weight ?? 1;
                    $studentWeight += $componentWeight;
                    $percentage = $componentItems->sum('max_score') > 0
                        ? ($componentItems->sum('score') / $componentItems->sum('max_score')) * 100
                        : 0;
                    $studentScore += $percentage * $componentWeight;
                }
                if ($studentWeight > 0) {
                    $totalWeight += $studentWeight;
                    $weightedScore += $studentScore;
                }
            }

            return [
                'id' => $class->id,
                'name' => $class->name,
                'subject' => $class->subject,
                'students_count' => $class->students_count,
                'average' => $totalWeight > 0 ? round($weightedScore / $totalWeight, 2) : 0,
                'entries_count' => $entries->count(),
            ];
        })->values();
    }

    public function perClass(string $teacherUserId): array
    {
        return [
            'overview' => $this->overview($teacherUserId),
            'attendance_trend' => $this->attendanceTrend($teacherUserId),
            'grade_distribution' => $this->gradeDistribution($teacherUserId),
            'class_performance' => $this->classPerformance($teacherUserId),
        ];
    }
}
