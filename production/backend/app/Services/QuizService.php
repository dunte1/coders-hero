<?php

namespace App\Services;

use App\Jobs\ProcessQuizSubmissionJob;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Repositories\Interfaces\QuizRepositoryInterface;

class QuizService
{
    public function __construct(
        private QuizRepositoryInterface $quizRepository
    ) {}

    public function getAll(int $perPage = 15)
    {
        return $this->quizRepository->paginate($perPage, ['*'], ['lesson', 'questions']);
    }

    public function getById(int $id): ?Quiz
    {
        return $this->quizRepository->findWithQuestions($id);
    }

    public function create(array $data): Quiz
    {
        $quiz = $this->quizRepository->create([
            'lesson_id' => $data['lesson_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'passing_score' => $data['passing_score'] ?? 70,
            'time_limit_minutes' => $data['time_limit_minutes'] ?? null,
            'max_attempts' => $data['max_attempts'] ?? 3,
            'is_randomized' => $data['is_randomized'] ?? false,
        ]);

        if (!empty($data['questions'])) {
            foreach ($data['questions'] as $index => $questionData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'correct_answer' => $questionData['correct_answer'],
                    'explanation' => $questionData['explanation'] ?? null,
                    'points' => $questionData['points'] ?? 1,
                    'sort_order' => $questionData['sort_order'] ?? $index + 1,
                ]);
            }
        }

        return $quiz->fresh(['questions']);
    }

    public function update(int $id, array $data): Quiz
    {
        $quiz = $this->quizRepository->update($id, collect($data)->only([
            'title', 'description', 'passing_score', 'time_limit_minutes',
            'max_attempts', 'is_randomized'
        ])->toArray());

        if (!empty($data['questions'])) {
            $quiz->questions()->delete();
            foreach ($data['questions'] as $index => $questionData) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question' => $questionData['question'],
                    'type' => $questionData['type'],
                    'options' => $questionData['options'] ?? null,
                    'correct_answer' => $questionData['correct_answer'],
                    'explanation' => $questionData['explanation'] ?? null,
                    'points' => $questionData['points'] ?? 1,
                    'sort_order' => $questionData['sort_order'] ?? $index + 1,
                ]);
            }
        }

        return $quiz->fresh(['questions']);
    }

    public function delete(int $id): bool
    {
        return $this->quizRepository->delete($id);
    }

    public function submitAttempt(string $userId, int $quizId, array $answers): QuizAttempt
    {
        $quiz = $this->quizRepository->findWithQuestions($quizId);

        if (!$quiz) {
            throw new \Exception('Quiz not found.');
        }

        $previousAttempts = QuizAttempt::where('user_id', $userId)
            ->where('quiz_id', $quizId)
            ->completed()
            ->count();

        if ($previousAttempts >= $quiz->max_attempts) {
            throw new \Exception('Maximum attempts reached for this quiz.');
        }

        $attempt = QuizAttempt::create([
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'answers' => $answers,
            'started_at' => now(),
            'completed_at' => now(),
        ]);

        $score = $this->calculateScore($quiz, $answers);

        $attempt->update([
            'score' => $score['percentage'],
            'is_passed' => $score['percentage'] >= $quiz->passing_score,
        ]);

        return $attempt->fresh();
    }

    public function calculateScore(Quiz $quiz, array $answers): array
    {
        $questions = $quiz->questions;
        $totalPoints = $questions->sum('points');
        $earnedPoints = 0;
        $results = [];

        foreach ($questions as $question) {
            $userAnswer = $answers[$question->id] ?? null;
            $isCorrect = strtolower(trim((string) $userAnswer)) === strtolower(trim($question->correct_answer));

            if ($isCorrect) {
                $earnedPoints += $question->points;
            }

            $results[] = [
                'question_id' => $question->id,
                'user_answer' => $userAnswer,
                'correct_answer' => $question->correct_answer,
                'is_correct' => $isCorrect,
                'points_earned' => $isCorrect ? $question->points : 0,
                'points_possible' => $question->points,
                'explanation' => $question->explanation,
            ];
        }

        $percentage = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;

        return [
            'earned_points' => $earnedPoints,
            'total_points' => $totalPoints,
            'percentage' => $percentage,
            'results' => $results,
        ];
    }

    public function getAttemptHistory(string $userId, ?int $quizId = null, int $perPage = 15)
    {
        return $this->quizRepository->getAttemptHistory($userId, $quizId, $perPage);
    }

    public function getStatistics(int $quizId): array
    {
        return $this->quizRepository->getQuizStatistics($quizId);
    }

    public function findByCourse(int $courseId, int $perPage = 15)
    {
        return $this->quizRepository->findByCourse($courseId, $perPage);
    }
}
