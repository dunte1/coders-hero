<?php

namespace App\Repositories\Interfaces;

use App\Models\Quiz;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface QuizRepositoryInterface extends BaseRepositoryInterface
{
    public function findByCourse(int $courseId, int $perPage = 15): LengthAwarePaginator;

    public function getAttemptHistory(string $userId, ?int $quizId = null, int $perPage = 15): LengthAwarePaginator;

    public function getQuizStatistics(int $quizId): array;

    public function findWithQuestions(int $quizId): ?Quiz;
}
