<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\StudentTimelineEntry;
use App\Services\Students\StudentService;
use App\Services\Students\StudentTimelineService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentTimelineController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StudentTimelineService $timelineService,
        private StudentService $studentService
    ) {}

    public function index(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        $entries = $this->timelineService->list(
            $studentId,
            $request->only(['type', 'from', 'to']),
            (int) $request->get('per_page', 30)
        );

        return $this->paginatedResponse($entries, 'Timeline retrieved successfully.');
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'event_type' => ['required', 'string', 'max:100'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'occurred_on' => ['nullable', 'date'],
        ]);

        $entry = $this->timelineService->store($studentId, $validated);

        return $this->createdResponse($entry, 'Timeline entry added successfully.');
    }

    public function destroy(int $entryId): JsonResponse
    {
        $entry = StudentTimelineEntry::find($entryId);

        if (!$entry) {
            return $this->notFoundResponse('Timeline entry not found.');
        }

        $this->authorize('update', $entry->student);

        $this->timelineService->delete($entryId);

        return $this->noContentResponse('Timeline entry deleted successfully.');
    }
}
