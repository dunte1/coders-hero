<?php

namespace App\Services;

use App\Models\Course;
use App\Repositories\Interfaces\CourseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CourseService
{
    public function __construct(
        private CourseRepositoryInterface $courseRepository
    ) {}

    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return $this->courseRepository->paginate($perPage, ['*'], ['category', 'instructor', 'lessons']);
    }

    public function getById(int $id): ?Course
    {
        return $this->courseRepository->findById($id, ['*'], ['category', 'instructor', 'lessons', 'enrollments']);
    }

    public function create(array $data): Course
    {
        $data['slug'] = \Str::slug($data['title']);
        $data['status'] = $data['status'] ?? 'draft';

        return $this->courseRepository->create($data);
    }

    public function update(int $id, array $data): Course
    {
        if (isset($data['title'])) {
            $data['slug'] = \Str::slug($data['title']);
        }

        return $this->courseRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->courseRepository->delete($id);
    }

    public function publish(int $id): Course
    {
        return $this->courseRepository->publish($id);
    }

    public function archive(int $id): Course
    {
        return $this->courseRepository->archive($id);
    }

    public function duplicate(int $id): Course
    {
        return $this->courseRepository->duplicate($id);
    }

    public function search(?string $term, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->courseRepository->search($term, $filters, $perPage);
    }

    public function findByCategory(int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->courseRepository->findByCategory($categoryId, $perPage);
    }

    public function findByInstructor(string $instructorId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->courseRepository->findByInstructor($instructorId, $perPage);
    }

    public function getFeatured(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $this->courseRepository->getFeatured($limit);
    }

    public function getEnrolledCourses(string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->courseRepository->getEnrolledCourses($userId, $perPage);
    }

    public function getCourseStats(int $courseId): array
    {
        $course = $this->courseRepository->findById($courseId, ['*'], ['enrollments', 'lessons']);

        return [
            'course' => $course,
            'total_lessons' => $course->lessons->count(),
            'total_enrollments' => $course->enrollments->count(),
            'completed_enrollments' => $course->enrollments()->where('status', 'completed')->count(),
            'average_progress' => round($course->enrollments->avg('progress') ?? 0, 2),
            'total_revenue' => \App\Models\Payment::whereHas('invoice', function ($q) use ($courseId) {
                $q->where('student_id', 'in', function ($sub) use ($courseId) {
                    $sub->select('student_id')->from('enrollments')->where('course_id', $courseId);
                });
            })->sum('amount'),
        ];
    }

    public function getPopularCourses(int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return Course::published()
            ->withCount('enrollments')
            ->orderByDesc('enrollments_count')
            ->take($limit)
            ->get();
    }

    public function getRecommendedCourses(string $userId, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        $enrolledCategoryIds = Course::whereHas('enrollments', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->pluck('category_id')->unique();

        return Course::published()
            ->whereIn('category_id', $enrolledCategoryIds)
            ->whereDoesntHave('enrollments', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->with(['category', 'instructor'])
            ->take($limit)
            ->get();
    }
}
