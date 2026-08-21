<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\ReportCard;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentReportCardController extends Controller
{
    use ApiResponse;

    public function index(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        return $this->successResponse(
            $student->reportCards()->with('items')->get(),
            'Report cards retrieved successfully.'
        );
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $student = Student::find($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'term' => ['required', 'string', 'max:60'],
            'academic_year' => ['required', 'string', 'max:20'],
            'issued_at' => ['required', 'date'],
            'overall_grade' => ['nullable', 'string', 'max:20'],
            'average_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'teacher_notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.subject' => ['required', 'string', 'max:80'],
            'items.*.score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.grade' => ['nullable', 'string', 'max:20'],
            'items.*.teacher_comment' => ['nullable', 'string', 'max:255'],
        ]);

        $reportCard = $student->reportCards()->create([
            'term' => $validated['term'],
            'academic_year' => $validated['academic_year'],
            'issued_at' => $validated['issued_at'],
            'overall_grade' => $validated['overall_grade'] ?? null,
            'average_score' => $validated['average_score'] ?? null,
            'teacher_notes' => $validated['teacher_notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $reportCard->items()->create($item);
        }

        return $this->createdResponse($reportCard->load('items'), 'Report card created successfully.');
    }

    public function update(Request $request, int $reportCardId): JsonResponse
    {
        $reportCard = ReportCard::with('student')->find($reportCardId);

        if (!$reportCard) {
            return $this->notFoundResponse('Report card not found.');
        }

        $this->authorize('update', $reportCard->student);

        $validated = $request->validate([
            'term' => ['sometimes', 'string', 'max:60'],
            'academic_year' => ['sometimes', 'string', 'max:20'],
            'issued_at' => ['sometimes', 'date'],
            'overall_grade' => ['nullable', 'string', 'max:20'],
            'average_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'teacher_notes' => ['nullable', 'string'],
        ]);

        $reportCard->update($validated);

        return $this->successResponse($reportCard->load('items'), 'Report card updated successfully.');
    }

    public function destroy(int $reportCardId): JsonResponse
    {
        $reportCard = ReportCard::with('student')->find($reportCardId);

        if (!$reportCard) {
            return $this->notFoundResponse('Report card not found.');
        }

        $this->authorize('update', $reportCard->student);

        $reportCard->delete();

        return $this->noContentResponse('Report card deleted successfully.');
    }
}
