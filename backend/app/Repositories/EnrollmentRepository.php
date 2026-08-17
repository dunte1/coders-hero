<?php

namespace App\Repositories;

use App\Models\Enrollment;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EnrollmentRepository extends BaseRepository implements EnrollmentRepositoryInterface
{
    public function __construct(Enrollment $model)
    {
        parent::__construct($model);
    }

    public function findByUserAndCourse(string $userId, int $courseId): ?Enrollment
    {
        return $this->model->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();
    }

    public function getActiveEnrollments(string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->active()
            ->where('user_id', $userId)
            ->with(['course', 'course.category', 'course.instructor'])
            ->orderByDesc('enrolled_at')
            ->paginate($perPage);
    }

    public function getCompletedEnrollments(string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->completed()
            ->where('user_id', $userId)
            ->with(['course', 'course.category', 'certificate'])
            ->orderByDesc('completed_at')
            ->paginate($perPage);
    }

    public function updateProgress(int $enrollmentId, float $progress): Enrollment
    {
        $enrollment = $this->model->findOrFail($enrollmentId);

        $updateData = ['progress' => min($progress, 100)];

        if ($progress >= 100) {
            $updateData['status'] = 'completed';
            $updateData['completed_at'] = now();
        }

        $enrollment->update($updateData);
        return $enrollment->fresh();
    }

    public function getEnrollmentStats(string $userId): array
    {
        $enrollments = $this->model->where('user_id', $userId);

        return [
            'total' => (clone $enrollments)->count(),
            'active' => (clone $enrollments)->active()->count(),
            'completed' => (clone $enrollments)->completed()->count(),
            'paused' => (clone $enrollments)->where('status', 'paused')->count(),
            'dropped' => (clone $enrollments)->where('status', 'dropped')->count(),
            'average_progress' => (clone $enrollments)->avg('progress') ?? 0,
        ];
    }

    public function getCourseEnrollmentStats(int $courseId): array
    {
        $enrollments = $this->model->where('course_id', $courseId);

        return [
            'total' => (clone $enrollments)->count(),
            'active' => (clone $enrollments)->active()->count(),
            'completed' => (clone $enrollments)->completed()->count(),
            'average_progress' => round((clone $enrollments)->avg('progress') ?? 0, 2),
        ];
    }
}
