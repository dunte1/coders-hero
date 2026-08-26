<?php

namespace App\Services;

use App\Jobs\GenerateCertificateJob;
use App\Jobs\SyncCourseProgressJob;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Lesson;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EnrollmentService
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollmentRepository
    ) {}

    public function enroll(string $userId, int $courseId): Enrollment
    {
        $existing = $this->enrollmentRepository->findByUserAndCourse($userId, $courseId);

        if ($existing) {
            if ($existing->status === 'dropped') {
                $existing->update(['status' => 'active', 'enrolled_at' => now(), 'progress' => 0]);
                return $existing->fresh();
            }
            throw new \Exception('Already enrolled in this course.');
        }

        $course = Course::findOrFail($courseId);

        if ($course->status !== 'published') {
            throw new \Exception('This course is not available for enrollment.');
        }

        if ($course->max_enrollments && $course->enrollments()->count() >= $course->max_enrollments) {
            throw new \Exception('This course has reached maximum enrollment capacity.');
        }

        if ((float) $course->price > 0) {
            $student = \App\Models\Student::where('user_id', $userId)->first();

            if ($student) {
                $hasPaid = Invoice::where('student_id', $student->id)
                    ->where('description', 'like', '%' . $course->title . '%')
                    ->whereIn('status', ['paid'])
                    ->exists();

                if (!$hasPaid) {
                    throw new \Exception('Payment is required before enrolling in this course.');
                }
            }
        }

        return $this->enrollmentRepository->create([
            'user_id' => $userId,
            'course_id' => $courseId,
            'status' => 'active',
            'enrolled_at' => now(),
            'progress' => 0,
        ]);
    }

    public function unenroll(string $userId, int $courseId): bool
    {
        $enrollment = $this->enrollmentRepository->findByUserAndCourse($userId, $courseId);

        if (!$enrollment) {
            throw new \Exception('Enrollment not found.');
        }

        $enrollment->update(['status' => 'dropped']);
        return true;
    }

    public function updateProgress(string $userId, int $lessonId): Enrollment
    {
        $lesson = Lesson::findOrFail($lessonId);
        $enrollment = $this->enrollmentRepository->findByUserAndCourse($userId, $lesson->course_id);

        if (!$enrollment) {
            throw new \Exception('Not enrolled in this course.');
        }

        return DB::transaction(function () use ($userId, $lessonId, $lesson, $enrollment) {
            $existingCompletion = \App\Models\LessonCompletion::where('user_id', $userId)
                ->where('lesson_id', $lessonId)
                ->first();

            if (!$existingCompletion) {
                \App\Models\LessonCompletion::create([
                    'user_id' => $userId,
                    'lesson_id' => $lessonId,
                    'enrollment_id' => $enrollment->id,
                    'completed_at' => now(),
                    'time_spent_minutes' => $lesson->duration_minutes,
                ]);
            }

            $totalLessons = Lesson::where('course_id', $lesson->course_id)->count();
            $completedLessons = \App\Models\LessonCompletion::where('user_id', $userId)
                ->whereHas('lesson', function ($q) use ($lesson) {
                    $q->where('course_id', $lesson->course_id);
                })->count();

            $progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0;

            SyncCourseProgressJob::dispatch($enrollment->id, $progress);

            return $this->enrollmentRepository->updateProgress($enrollment->id, $progress);
        });
    }

    public function completeCourse(string $userId, int $courseId): Enrollment
    {
        $enrollment = $this->enrollmentRepository->findByUserAndCourse($userId, $courseId);

        if (!$enrollment) {
            throw new \Exception('Enrollment not found.');
        }

        $enrollment = $this->enrollmentRepository->updateProgress($enrollment->id, 100);

        if ($enrollment->certificate()->doesntExist()) {
            GenerateCertificateJob::dispatch($enrollment);
        }

        return $enrollment;
    }

    public function getMyCourses(string $userId, int $perPage = 15)
    {
        return $this->enrollmentRepository->getActiveEnrollments($userId, $perPage);
    }

    public function getCompletedCourses(string $userId, int $perPage = 15)
    {
        return $this->enrollmentRepository->getCompletedEnrollments($userId, $perPage);
    }

    public function getEnrollmentStats(string $userId): array
    {
        return $this->enrollmentRepository->getEnrollmentStats($userId);
    }

    public function getCertificate(string $userId, int $courseId)
    {
        $enrollment = $this->enrollmentRepository->findByUserAndCourse($userId, $courseId);

        if (!$enrollment || !$enrollment->certificate) {
            throw new \Exception('Certificate not found.');
        }

        return $enrollment->certificate;
    }

    public function show(string $userId, int $courseId): ?Enrollment
    {
        return $this->enrollmentRepository->findByUserAndCourse($userId, $courseId);
    }
}
