<?php

namespace App\Services\Lms;

use App\Models\Course;
use App\Models\CourseRating;

class RatingService
{
    public function forCourse(int $courseId, int $perPage = 15)
    {
        return CourseRating::query()
            ->with('user')
            ->where('course_id', $courseId)
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function rate(string $userId, int $courseId, int $rating, ?string $review = null): CourseRating
    {
        return CourseRating::updateOrCreate(
            ['course_id' => $courseId, 'user_id' => $userId],
            ['rating' => $rating, 'review' => $review]
        );
    }

    public function userRating(string $userId, int $courseId): ?CourseRating
    {
        return CourseRating::where('course_id', $courseId)->where('user_id', $userId)->first();
    }

    public function summary(int $courseId): array
    {
        $ratings = CourseRating::where('course_id', $courseId)->get();

        return [
            'count' => $ratings->count(),
            'average' => $ratings->count() > 0 ? round($ratings->avg('rating'), 1) : 0,
            'distribution' => [
                5 => $ratings->where('rating', 5)->count(),
                4 => $ratings->where('rating', 4)->count(),
                3 => $ratings->where('rating', 3)->count(),
                2 => $ratings->where('rating', 2)->count(),
                1 => $ratings->where('rating', 1)->count(),
            ],
        ];
    }

    public function syncCourseAverage(Course $course): void
    {
        $summary = $this->summary($course->id);

        $meta = $course->meta ?? [];
        $meta['average_rating'] = $summary['average'];
        $meta['ratings_count'] = $summary['count'];

        $course->update(['meta' => $meta]);
    }
}
