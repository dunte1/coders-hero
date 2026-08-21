<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\CodingProgress;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentProgressController extends Controller
{
    use ApiResponse;

    public function index(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        return $this->successResponse($student->codingProgress()->get(), 'Coding progress retrieved successfully.');
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $student = Student::find($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'skill' => ['required', 'string', 'max:80'],
            'level' => ['nullable', 'integer', 'min:1', 'max:20'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'badge' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ]);

        $progress = $student->codingProgress()->updateOrCreate(
            ['skill' => $validated['skill']],
            [
                'level' => $validated['level'] ?? 1,
                'progress' => $validated['progress'] ?? 0,
                'badge' => $validated['badge'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return $this->createdResponse($progress, 'Coding progress saved successfully.');
    }

    public function update(Request $request, int $progressId): JsonResponse
    {
        $progress = CodingProgress::with('student')->find($progressId);

        if (!$progress) {
            return $this->notFoundResponse('Coding progress not found.');
        }

        $this->authorize('update', $progress->student);

        $validated = $request->validate([
            'skill' => ['sometimes', 'string', 'max:80'],
            'level' => ['nullable', 'integer', 'min:1', 'max:20'],
            'progress' => ['nullable', 'integer', 'min:0', 'max:100'],
            'badge' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string'],
        ]);

        $progress->update($validated);

        return $this->successResponse($progress, 'Coding progress updated successfully.');
    }

    public function destroy(int $progressId): JsonResponse
    {
        $progress = CodingProgress::with('student')->find($progressId);

        if (!$progress) {
            return $this->notFoundResponse('Coding progress not found.');
        }

        $this->authorize('update', $progress->student);

        $progress->delete();

        return $this->noContentResponse('Coding progress deleted successfully.');
    }
}
