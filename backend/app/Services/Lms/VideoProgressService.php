<?php

namespace App\Services\Lms;

use App\Models\LessonCompletion;
use App\Models\VideoProgress;

class VideoProgressService
{
    public function update(string $userId, int $lessonId, int $watchedSeconds, ?int $durationSeconds = null, ?bool $completed = null): VideoProgress
    {
        $progress = VideoProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lessonId],
            [
                'watched_seconds' => $watchedSeconds,
                'duration_seconds' => $durationSeconds,
                'last_watched_at' => now(),
            ]
        );

        if ($completed !== null) {
            $progress->update(['completed' => $completed]);
        }

        return $progress->fresh();
    }

    public function forLesson(string $userId, int $lessonId): ?VideoProgress
    {
        return VideoProgress::where('user_id', $userId)->where('lesson_id', $lessonId)->first();
    }

    public function forCourse(string $userId, int $courseId)
    {
        return VideoProgress::query()
            ->where('user_id', $userId)
            ->whereHas('lesson', fn ($q) => $q->where('course_id', $courseId))
            ->get();
    }

    public function markCompleted(string $userId, int $courseId, int $lessonId): array
    {
        VideoProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lessonId],
            ['completed' => true, 'last_watched_at' => now()]
        );

        LessonCompletion::firstOrCreate([
            'user_id' => $userId,
            'course_id' => $courseId,
            'lesson_id' => $lessonId,
        ]);

        return $this->courseProgress($userId, $courseId);
    }

    public function courseProgress(string $userId, int $courseId): array
    {
        $lessons = \App\Models\Lesson::where('course_id', $courseId)->orderBy('sort_order')->pluck('id');

        $completedIds = LessonCompletion::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->pluck('lesson_id');

        $total = $lessons->count();

        return [
            'total_lessons' => $total,
            'completed_lessons' => $completedIds->count(),
            'percentage' => $total > 0 ? round(($completedIds->count() / $total) * 100, 1) : 0,
            'completed_lesson_ids' => $completedIds,
        ];
    }
}
