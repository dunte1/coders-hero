<?php

namespace App\Services\Teachers;

use App\Models\Attendance;
use App\Models\GradebookEntry;
use App\Models\SchoolClass;
use App\Models\Student;

class TeacherReportService
{
    public function classReport(int $classId, string $teacherUserId, array $filters = []): array
    {
        $class = SchoolClass::byTeacher($teacherUserId)
            ->with('students')
            ->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->endOfMonth()->toDateString();

        $students = $class->students->sortBy('first_name')->values();

        $rows = $students->map(function (Student $student) use ($classId, $from, $to) {
            $attendances = Attendance::forStudent($student->id)
                ->whereDate('attendance_date', '>=', $from)
                ->whereDate('attendance_date', '<=', $to)
                ->get();

            $grades = GradebookEntry::where('class_id', $classId)
                ->where('student_id', $student->id)
                ->get();

            $totalWeight = 0;
            $weightedScore = 0;

            foreach ($grades->groupBy('component') as $items) {
                $componentWeight = $items->first()?->weight ?? 1;
                $totalWeight += $componentWeight;
                $percentage = $items->sum('max_score') > 0
                    ? ($items->sum('score') / $items->sum('max_score')) * 100
                    : 0;
                $weightedScore += $percentage * $componentWeight;
            }

            return [
                'student' => $student,
                'attendance_present' => $attendances->whereIn('status', ['present', 'late'])->count(),
                'attendance_late' => $attendances->where('status', 'late')->count(),
                'attendance_absent' => $attendances->where('status', 'absent')->count(),
                'attendance_rate' => $attendances->count() > 0
                    ? round(($attendances->whereIn('status', ['present', 'late'])->count() / $attendances->count()) * 100, 1)
                    : 0,
                'grade_entries' => $grades->count(),
                'grade_percentage' => $totalWeight > 0 ? round($weightedScore / $totalWeight, 2) : null,
            ];
        });

        return [
            'class' => $class,
            'from' => $from,
            'to' => $to,
            'rows' => $rows,
        ];
    }

    public function studentReport(int $classId, int $studentId, string $teacherUserId, array $filters = []): array
    {
        $class = SchoolClass::byTeacher($teacherUserId)->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $student = Student::with('guardian')->find($studentId);

        if (!$student || !$class->students()->where('students.id', $studentId)->exists()) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Student not found in this class.');
        }

        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->endOfMonth()->toDateString();

        $attendances = Attendance::forStudent($studentId)
            ->whereDate('attendance_date', '>=', $from)
            ->whereDate('attendance_date', '<=', $to)
            ->get();

        $assignments = \App\Models\Assignment::where('class_id', $classId)
            ->with('submissions')
            ->get()
            ->map(function ($assignment) use ($studentId) {
                $submission = $assignment->submissions->where('student_id', $studentId)->first();

                return [
                    'title' => $assignment->title,
                    'type' => $assignment->type,
                    'due_at' => $assignment->due_at,
                    'max_score' => $assignment->max_score,
                    'status' => $submission?->status ?? 'not_submitted',
                    'score' => $submission?->score,
                    'is_late' => $submission?->is_late ?? false,
                ];
            });

        $exams = \App\Models\Exam::where('class_id', $classId)
            ->with('results')
            ->get()
            ->map(function ($exam) use ($studentId) {
                $result = $exam->results->where('student_id', $studentId)->first();

                return [
                    'title' => $exam->title,
                    'type' => $exam->type,
                    'scheduled_at' => $exam->scheduled_at,
                    'total_marks' => $exam->total_marks,
                    'marks_obtained' => $result?->marks_obtained,
                    'percentage' => $result?->percentage,
                    'grade' => $result?->grade,
                    'status' => $result?->status ?? 'not_graded',
                ];
            });

        return [
            'student' => $student,
            'class' => $class,
            'from' => $from,
            'to' => $to,
            'attendance' => [
                'present' => $attendances->whereIn('status', ['present', 'late'])->count(),
                'late' => $attendances->where('status', 'late')->count(),
                'absent' => $attendances->where('status', 'absent')->count(),
                'excused' => $attendances->where('status', 'excused')->count(),
                'rate' => $attendances->count() > 0
                    ? round(($attendances->whereIn('status', ['present', 'late'])->count() / $attendances->count()) * 100, 1)
                    : 0,
            ],
            'assignments' => $assignments,
            'exams' => $exams,
        ];
    }

    public function teacherSummary(string $teacherUserId, array $filters = []): array
    {
        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->endOfMonth()->toDateString();

        $classes = SchoolClass::byTeacher($teacherUserId)->get();

        $classIds = $classes->pluck('id');
        $studentIds = \Illuminate\Support\Facades\DB::table('class_student')
            ->whereIn('class_id', $classIds)
            ->pluck('student_id')
            ->unique();

        $attendances = Attendance::whereIn('student_id', $studentIds)
            ->whereDate('attendance_date', '>=', $from)
            ->whereDate('attendance_date', '<=', $to)
            ->get();

        $assignments = \App\Models\Assignment::byTeacher($teacherUserId)
            ->whereDate('due_at', '>=', $from)
            ->whereDate('due_at', '<=', $to)
            ->get();

        $submissions = \App\Models\AssignmentSubmission::whereIn('assignment_id', $assignments->pluck('id'))->get();

        return [
            'classes_count' => $classes->count(),
            'students_count' => $studentIds->count(),
            'attendance_rate' => $attendances->count() > 0
                ? round(($attendances->whereIn('status', ['present', 'late'])->count() / $attendances->count()) * 100, 1)
                : 0,
            'assignments_count' => $assignments->count(),
            'submissions_count' => $submissions->whereIn('status', ['submitted', 'graded'])->count(),
            'graded_count' => $submissions->where('status', 'graded')->count(),
            'overdue_assignments' => $assignments->where('due_at', '<', now())->count(),
        ];
    }
}
