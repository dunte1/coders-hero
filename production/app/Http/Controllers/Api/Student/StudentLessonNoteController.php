<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\LessonNote;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentLessonNoteController extends Controller
{
    /**
     * Lesson notes and downloadable materials for the classes the
     * authenticated student belongs to.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return $this->successResponse([], 'No lesson notes found.');
        }

        $classIds = $student->schoolClasses()->pluck('classes.id')->all();

        $query = LessonNote::query()
            ->with(['lesson:id,title', 'schoolClass:id,name', 'teacher:id,name'])
            ->whereIn('class_id', $classIds)
            ->when($request->filled('class_id'), fn ($q) => $q->where('class_id', $request->integer('class_id')))
            ->when($request->filled('search'), fn ($q) => $q->where('title', 'like', "%{$request->string('search')}%"))
            ->orderByDesc('note_date');

        $notes = $query->get()->map(fn (LessonNote $note) => $this->transform($note));

        return $this->successResponse($notes, 'Lesson materials retrieved successfully.');
    }

    private function transform(LessonNote $note): array
    {
        return [
            'id' => $note->id,
            'title' => $note->title,
            'content' => $note->content,
            'note_date' => $note->note_date?->toDateString(),
            'lesson' => $note->lesson?->only(['id', 'title']),
            'class' => $note->schoolClass?->only(['id', 'name']),
            'teacher' => $note->teacher?->only(['id', 'name']),
            'attachments' => collect($note->attachments ?? [])->map(function (array $file) {
                return [
                    'name' => $file['name'] ?? basename($file['path'] ?? ''),
                    'size' => $file['size'] ?? null,
                    'path' => $file['path'] ?? null,
                    'url' => isset($file['path']) ? Storage::disk('public')->url($file['path']) : null,
                ];
            })->all(),
        ];
    }
}
