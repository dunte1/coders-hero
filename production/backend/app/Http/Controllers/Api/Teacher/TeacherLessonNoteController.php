<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreLessonNoteRequest;
use App\Http\Requests\Teacher\UpdateLessonNoteRequest;
use App\Services\Teachers\LessonNoteService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherLessonNoteController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LessonNoteService $noteService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $notes = $this->noteService->getAll(
            auth()->id(),
            $request->only(['class_id', 'lesson_id', 'from', 'to', 'search']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($notes, 'Lesson notes retrieved successfully.');
    }

    public function store(StoreLessonNoteRequest $request): JsonResponse
    {
        $note = $this->noteService->create(auth()->id(), $request->validated());

        return $this->createdResponse($note, 'Lesson note created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $note = $this->noteService->getById($id, auth()->id());

        if (!$note) {
            return $this->notFoundResponse('Lesson note not found.');
        }

        return $this->successResponse($note, 'Lesson note retrieved successfully.');
    }

    public function update(UpdateLessonNoteRequest $request, int $id): JsonResponse
    {
        try {
            $note = $this->noteService->update($id, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($note, 'Lesson note updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->noteService->delete($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Lesson note deleted successfully.');
    }

    public function attachFile(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'],
        ]);

        try {
            $note = $this->noteService->attachFile($id, auth()->id(), $request->file('file'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($note, 'File attached successfully.');
    }
}
