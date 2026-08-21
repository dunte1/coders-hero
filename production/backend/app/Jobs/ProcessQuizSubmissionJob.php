<?php

namespace App\Jobs;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessQuizSubmissionJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public QuizAttempt $attempt,
        public array $answers
    ) {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $quiz = $this->attempt->quiz()->with('questions')->first();

        $questions = $quiz->questions;
        $totalPoints = $questions->sum('points');
        $earnedPoints = 0;
        $detailedResults = [];

        foreach ($questions as $question) {
            $userAnswer = $this->answers[$question->id] ?? null;
            $isCorrect = strtolower(trim((string) $userAnswer)) === strtolower(trim($question->correct_answer));

            if ($isCorrect) {
                $earnedPoints += $question->points;
            }

            $detailedResults[] = [
                'question_id' => $question->id,
                'user_answer' => $userAnswer,
                'correct_answer' => $question->correct_answer,
                'is_correct' => $isCorrect,
                'points_earned' => $isCorrect ? $question->points : 0,
                'points_possible' => $question->points,
            ];
        }

        $percentage = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0;

        $this->attempt->update([
            'score' => $percentage,
            'is_passed' => $percentage >= $quiz->passing_score,
            'completed_at' => now(),
            'answers' => array_merge($this->answers, ['_results' => $detailedResults]),
        ]);

        if ($this->attempt->is_passed) {
            \App\Jobs\SendNotificationJob::dispatch(
                $this->attempt->user_id,
                'Quiz Passed!',
                "You passed the quiz: {$quiz->title} with a score of {$percentage}%",
                'quiz_passed'
            );
        }

        activity()
            ->performedOn($quiz)
            ->event('quiz_submitted')
            ->withProperties([
                'user_id' => $this->attempt->user_id,
                'score' => $percentage,
                'is_passed' => $this->attempt->is_passed,
            ])
            ->log('Quiz submission processed');
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("Failed to process quiz submission {$this->attempt->id}: {$exception->getMessage()}");
    }
}
