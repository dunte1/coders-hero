<?php

namespace App\Services\Lms;

use App\Models\CodingExercise;
use App\Models\CodingSubmission;
use App\Models\User;

class CodingLeaderboardService
{
    public function forCourse(int $courseId, string $period = 'alltime'): array
    {
        $exercises = CodingExercise::byCourse($courseId)->published()->pluck('id');

        $submissions = CodingSubmission::whereIn('exercise_id', $exercises)
            ->where('status', 'correct')
            ->with(['user' => fn ($q) => $q->select('id', 'name', 'email')])
            ->get();

        $byExercise = $submissions->groupBy('exercise_id');

        $leaderboard = [];

        foreach ($byExercise as $exerciseId => $exerciseSubmissions) {
            $leaderboard[$exerciseId] = [
                'exercise_title' => CodingExercise::find($exerciseId)?->title ?? 'Unknown',
                'solved_count' => $exerciseSubmissions->count(),
                'users' => $exerciseSubmissions->sortByDesc('score')->values()->all()->map(fn ($s) => [
                    'user_id' => $s->user_id,
                    'user_name' => $s->user?->name ?? 'Unknown',
                    'score' => $s->score,
                    'submitted_at' => $s->submitted_at,
                ]),
            ];
        }

        return [
            'course_id' => $courseId,
            'period' => $period,
            'leaderboard' => $leaderboard,
        ];
    }

    public function forExercise(int $exerciseId, string $period = 'alltime'): array
    {
        $submissions = CodingSubmission::where('exercise_id', $exerciseId)
            ->where('status', 'correct')
            ->with(['user' => fn ($q) => $q->select('id', 'name', 'email')])
            ->orderByDesc('score')
            ->get();

        return [
            'exercise_id' => $exerciseId,
            'period' => $period,
            'leaderboard' => $submissions->sortByDesc('score')->values()->map(fn ($s) => [
                'user_id' => $s->user_id,
                'user_name' => $s->user?->name ?? 'Unknown',
                'score' => $s->score,
                'submitted_at' => $s->submitted_at,
            ])->all(),
        ];
    }
}