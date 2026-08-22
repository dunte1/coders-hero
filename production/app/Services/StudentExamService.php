<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\ExamQuestion;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StudentExamService
{
    public function availableExams(User $user)
    {
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return collect();
        }

        $classIds = $student->schoolClasses()->pluck('classes.id');

        return Exam::whereIn('class_id', $classIds)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->where('scheduled_at', '>=', now()->subHours(24))
            ->with('schoolClass:id,name')
            ->orderBy('scheduled_at', 'asc')
            ->get();
    }

    public function show(User $user, int $id): ?Exam
    {
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return null;
        }

        $classIds = $student->schoolClasses()->pluck('classes.id');

        $exam = Exam::whereIn('class_id', $classIds)
            ->with([
                'questions' => function ($query) {
                    $query->orderBy('sort_order');
                },
                'schoolClass:id,name',
                'course:id,title',
            ])
            ->find($id);

        if (!$exam) {
            return null;
        }

        $exam->questions->each(function ($question) {
            $question->makeHidden(['correct_answer']);
        });

        $attemptCount = ExamAttempt::where('exam_id', $id)
            ->where('student_id', $student->id)
            ->count();

        $exam->attempt_count = $attemptCount;

        return $exam;
    }

    public function startAttempt(User $user, int $id): ?ExamAttempt
    {
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return null;
        }

        $classIds = $student->schoolClasses()->pluck('classes.id');

        $exam = Exam::whereIn('class_id', $classIds)
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->find($id);

        if (!$exam) {
            return null;
        }

        $existingInProgress = ExamAttempt::where('exam_id', $id)
            ->where('student_id', $student->id)
            ->where('status', 'in_progress')
            ->exists();

        if ($existingInProgress) {
            return null;
        }

        $existingSubmitted = ExamAttempt::where('exam_id', $id)
            ->where('student_id', $student->id)
            ->where('status', 'submitted')
            ->exists();

        if ($existingSubmitted) {
            return null;
        }

        $totalPoints = ExamQuestion::where('exam_id', $id)->sum('points');

        return ExamAttempt::create([
            'exam_id' => $id,
            'student_id' => $student->id,
            'user_id' => $user->id,
            'total_points' => $totalPoints,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);
    }

    public function submitAttempt(User $user, int $id, array $answers): ?ExamAttempt
    {
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return null;
        }

        $attempt = ExamAttempt::where('exam_id', $id)
            ->where('student_id', $student->id)
            ->where('status', 'in_progress')
            ->first();

        if (!$attempt) {
            return null;
        }

        $questions = ExamQuestion::where('exam_id', $id)
            ->orderBy('sort_order')
            ->get();

        $earnedPoints = 0;

        foreach ($questions as $question) {
            $studentAnswer = $answers[$question->id] ?? null;

            if ($studentAnswer !== null && (string) $studentAnswer === (string) $question->correct_answer) {
                $earnedPoints += $question->points;
            }
        }

        $totalPoints = $questions->sum('points');
        $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;

        $attempt->update([
            'answers' => $answers,
            'earned_points' => $earnedPoints,
            'total_points' => $totalPoints,
            'score' => $score,
            'submitted_at' => now(),
            'status' => 'submitted',
        ]);

        return $attempt->fresh();
    }

    public function myAttempts(User $user)
    {
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return collect();
        }

        return ExamAttempt::where('student_id', $student->id)
            ->with('exam:id,title,scheduled_at,duration_minutes,status')
            ->latest('submitted_at')
            ->get();
    }
}
