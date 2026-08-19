<?php

namespace App\Repositories\Interfaces;

use App\Models\Course;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CourseRepositoryInterface extends BaseRepositoryInterface
{
    public function findPublished(int $perPage = 15): LengthAwarePaginator;

    public function findByCategory(int $categoryId, int $perPage = 15): LengthAwarePaginator;

    public function findByInstructor(string $instructorId, int $perPage = 15): LengthAwarePaginator;

    public function getFeatured(int $limit = 10): Collection;

    public function getEnrolledCourses(string $userId, int $perPage = 15): LengthAwarePaginator;

    public function search(?string $term, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function publish(int $courseId): Course;

    public function archive(int $courseId): Course;

    public function duplicate(int $courseId): Course;
}
