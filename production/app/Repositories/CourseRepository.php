<?php

namespace App\Repositories;

use App\Models\Course;
use App\Repositories\Interfaces\CourseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CourseRepository extends BaseRepository implements CourseRepositoryInterface
{
    public function __construct(Course $model)
    {
        parent::__construct($model);
    }

    public function findPublished(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->published()
            ->with(['category', 'instructor', 'lessons'])
            ->orderByDesc('published_at')
            ->paginate($perPage);
    }

    public function findByCategory(int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->published()
            ->where('category_id', $categoryId)
            ->with(['category', 'instructor'])
            ->paginate($perPage);
    }

    public function findByInstructor(string $instructorId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('instructor_id', $instructorId)
            ->with(['category', 'lessons', 'enrollments'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getFeatured(int $limit = 10): Collection
    {
        return $this->model->published()
            ->featured()
            ->with(['category', 'instructor'])
            ->take($limit)
            ->get();
    }

    public function getEnrolledCourses(string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->whereHas('enrollments', function ($q) use ($userId) {
            $q->where('user_id', $userId)->where('status', '!=', 'dropped');
        })->with(['category', 'instructor', 'enrollments' => function ($q) use ($userId) {
            $q->where('user_id', $userId);
        }])->paginate($perPage);
    }

    public function search(?string $term, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->published()->with(['category', 'instructor']);

        if ($term) {
            $query->where(function ($q) use ($term) {
                $q->where('title', 'LIKE', "%{$term}%")
                    ->orWhere('description', 'LIKE', "%{$term}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (!empty($filters['instructor_id'])) {
            $query->where('instructor_id', $filters['instructor_id']);
        }

        if (isset($filters['min_price']) && isset($filters['max_price'])) {
            $query->whereBetween('price', [$filters['min_price'], $filters['max_price']]);
        }

        return $query->orderByDesc('is_featured')->orderByDesc('published_at')->paginate($perPage);
    }

    public function publish(int $courseId): Course
    {
        $course = $this->model->findOrFail($courseId);
        $course->update(['status' => 'published', 'published_at' => now()]);
        return $course->fresh();
    }

    public function archive(int $courseId): Course
    {
        $course = $this->model->findOrFail($courseId);
        $course->update(['status' => 'archived']);
        return $course->fresh();
    }

    public function duplicate(int $courseId): Course
    {
        $original = $this->model->with('lessons')->findOrFail($courseId);

        $newCourse = $original->replicate(['slug', 'status', 'published_at']);
        $newCourse->title = $original->title . ' (Copy)';
        $newCourse->status = 'draft';
        $newCourse->published_at = null;
        $newCourse->save();

        foreach ($original->lessons as $lesson) {
            $newLesson = $lesson->replicate(['slug']);
            $newLesson->course_id = $newCourse->id;
            $newLesson->save();
        }

        return $newCourse->fresh(['lessons', 'category', 'instructor']);
    }
}
