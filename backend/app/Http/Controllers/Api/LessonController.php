<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Course\StoreLessonRequest;
use App\Http\Requests\Course\UpdateLessonRequest;
use App\Http\Resources\LessonDetailResource;
use App\Http\Resources\LessonResource;
use App\Models\Course;
use App\Models\Lesson;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    use ApiResponse;

    public function index(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        $lessons = $course->lessons()
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse(
            LessonResource::collection($lessons),
            'Lessons retrieved successfully.'
        );
    }

    public function store(StoreLessonRequest $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $this->authorize('update', $course);

        $lesson = $course->lessons()->create([
            'module_name' => $request->module_name,
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'video_url' => $request->video_url,
            'type' => $request->type,
            'duration_minutes' => $request->duration_minutes,
            'sort_order' => $request->sort_order ?? $course->lessons()->count() + 1,
            'is_free' => $request->is_free ?? false,
        ]);

        return $this->createdResponse(
            new LessonDetailResource($lesson->load('course')),
            'Lesson created successfully.'
        );
    }

    public function show(int $courseId, int $lessonId): JsonResponse
    {
        $lesson = Lesson::where('course_id', $courseId)->with('course')->findOrFail($lessonId);

        return $this->successResponse(
            new LessonDetailResource($lesson),
            'Lesson retrieved successfully.'
        );
    }

    public function update(UpdateLessonRequest $request, int $courseId, int $lessonId): JsonResponse
    {
        $lesson = Lesson::where('course_id', $courseId)->findOrFail($lessonId);
        $course = Course::findOrFail($courseId);
        $this->authorize('update', $course);

        $data = $request->validated();
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $lesson->update($data);

        return $this->successResponse(
            new LessonDetailResource($lesson->fresh()->load('course')),
            'Lesson updated successfully.'
        );
    }

    public function destroy(int $courseId, int $lessonId): JsonResponse
    {
        $lesson = Lesson::where('course_id', $courseId)->findOrFail($lessonId);
        $course = Course::findOrFail($courseId);
        $this->authorize('delete', $course);
        $lesson->delete();

        return $this->noContentResponse('Lesson deleted successfully.');
    }

    public function reorder(Request $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        $this->authorize('reorder', $course);

        $request->validate([
            'lesson_order' => ['required', 'array'],
            'lesson_order.*' => ['integer', 'exists:lessons,id'],
        ]);

        foreach ($request->lesson_order as $index => $lessonId) {
            Lesson::where('id', $lessonId)
                ->where('course_id', $courseId)
                ->update(['sort_order' => $index + 1]);
        }

        return $this->successResponse(null, 'Lessons reordered successfully.');
    }
}
