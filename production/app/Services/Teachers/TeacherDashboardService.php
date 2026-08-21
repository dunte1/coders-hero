<?php

namespace App\Services\Teachers;

use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\CalendarEvent;
use App\Models\Exam;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\DB;

class TeacherDashboardService
{
    public function summary(string $teacherUserId): array
    {
        $classIds = SchoolClass::byTeacher($teacherUserId)->pluck('id');

        $studentIds = DB::table('class_student')->whereIn('class_id', $classIds)->pluck('student_id')->unique();

        $publishedAssignments = Assignment::query()
            ->byTeacher($teacherUserId)
            ->where('status', 'published');

        $upcomingAssignments = $publishedAssignments
            ->where('due_at', '>=', now())
            ->withCount('submissions')
            ->orderBy('due_at')
            ->take(6)
            ->get();

        $today = now()->toDateString();

        $todayAttendance = Attendance::query()
            ->whereIn('student_id', $studentIds)
            ->forDate($today)
            ->get();

        $upcomingExams = Exam::query()
            ->byTeacher($teacherUserId)
            ->where('status', 'scheduled')
            ->where('scheduled_at', '>=', now())
            ->withCount('results')
            ->orderBy('scheduled_at')
            ->take(6)
            ->get();

        $upcomingEvents = CalendarEvent::query()
            ->where('user_id', $teacherUserId)
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->take(6)
            ->get();

        $ungradedSubmissions = DB::table('assignment_submissions')
            ->whereIn('assignment_id', Assignment::byTeacher($teacherUserId)->pluck('id'))
            ->whereIn('status', ['submitted', 'graded'])
            ->where(function ($q) {
                $q->whereNull('graded_at')->orWhere('status', 'submitted');
            })
            ->count();

        return [
            'classes_count' => SchoolClass::byTeacher($teacherUserId)->count(),
            'students_count' => $studentIds->count(),
            'today_present' => $todayAttendance->whereIn('status', ['present', 'late'])->count(),
            'today_absent' => $todayAttendance->where('status', 'absent')->count(),
            'today_unmarked' => max(0, $studentIds->count() - $todayAttendance->count()),
            'ungraded_submissions' => $ungradedSubmissions,
            'upcoming_assignments' => $upcomingAssignments,
            'upcoming_exams' => $upcomingExams,
            'upcoming_events' => $upcomingEvents,
        ];
    }
}
