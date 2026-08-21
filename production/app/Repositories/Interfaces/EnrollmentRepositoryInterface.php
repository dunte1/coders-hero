<?php

namespace App\Repositories\Interfaces;

use App\Models\Enrollment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface EnrollmentRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUserAndCourse(string $userId, int $courseId): ?Enrollment;

    public function getActiveEnrollments(string $userId, int $perPage = 15): LengthAwarePaginator;

    public function getCompletedEnrollments(string $userId, int $perPage = 15): LengthAwarePaginator;

    public function updateProgress(int $enrollmentId, float $progress): Enrollment;

    public function getEnrollmentStats(string $userId): array;

    public function getCourseEnrollmentStats(int $courseId): array;
}
