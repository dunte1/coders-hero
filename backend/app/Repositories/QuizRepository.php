<?php

namespace App\Repositories;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Repositories\Interfaces\QuizRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class QuizRepository extends BaseRepository implements QuizRepositoryInterface
{
    public function __construct(Quiz $model)
    {
        parent::__construct($model);
    }

    public function findByCourse(int $courseId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->whereHas('lesson', function ($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })->with(['lesson', 'questions'])
            ->paginate($perPage);
    }

    public function getAttemptHistory(string $userId, ?int $quizId = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = QuizAttempt::where('user_id', $userId)
            ->with(['quiz', 'quiz.lesson', 'quiz.lesson.course']);

        if ($quizId) {
            $query->where('quiz_id', $quizId);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function getQuizStatistics(int $quizId): array
    {
        $quiz = $this->model->with('questions')->findOrFail($quizId);
        $attempts = QuizAttempt::where('quiz_id', $quizId)->whereNotNull('completed_at');

        return [
            'quiz' => $quiz,
            'total_questions' => $quiz->questions->count(),
            'total_points' => $quiz->questions->sum('points'),
            'total_attempts' => (clone $attempts)->count(),
            'passed_attempts' => (clone $attempts)->where('is_passed', true)->count(),
            'pass_rate' => (clone $attempts)->count() > 0
                ? round(((clone $attempts)->where('is_passed', true)->count() / (clone $attempts)->count()) * 100, 2)
                : 0,
            'average_score' => round((clone $attempts)->avg('score') ?? 0, 2),
            'highest_score' => (clone $attempts)->max('score') ?? 0,
            'lowest_score' => (clone $attempts)->min('score') ?? 0,
        ];
    }

    public function findWithQuestions(int $quizId): ?Quiz
    {
        return $this->model->with(['questions' => function ($q) {
            $q->orderBy('sort_order');
        }])->find($quizId);
    }
}
