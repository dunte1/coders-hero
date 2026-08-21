<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\BulkGradebookRequest;
use App\Http\Requests\Teacher\StoreGradebookEntryRequest;
use App\Http\Requests\Teacher\UpdateGradebookEntryRequest;
use App\Services\Teachers\GradebookService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherGradebookController extends Controller
{
    use ApiResponse;

    public function __construct(
        private GradebookService $gradebookService
    ) {}

    public function index(Request $request, int $classId): JsonResponse
    {
        try {
            $entries = $this->gradebookService->entries(
                $classId,
                auth()->id(),
                $request->only(['student_id', 'component']),
                (int) $request->get('per_page', 50)
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->paginatedResponse($entries, 'Gradebook entries retrieved successfully.');
    }

    public function store(StoreGradebookEntryRequest $request, int $classId): JsonResponse
    {
        try {
            $entry = $this->gradebookService->create($classId, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse($entry, 'Gradebook entry created successfully.');
    }

    public function bulkStore(BulkGradebookRequest $request, int $classId): JsonResponse
    {
        try {
            $entries = $this->gradebookService->bulkCreate($classId, auth()->id(), $request->validated('entries'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->createdResponse($entries, 'Gradebook entries created successfully.');
    }

    public function update(UpdateGradebookEntryRequest $request, int $classId, int $entryId): JsonResponse
    {
        try {
            $entry = $this->gradebookService->update($entryId, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($entry, 'Gradebook entry updated successfully.');
    }

    public function destroy(int $classId, int $entryId): JsonResponse
    {
        try {
            $this->gradebookService->delete($entryId, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Gradebook entry deleted successfully.');
    }

    public function studentSummary(int $classId, int $studentId): JsonResponse
    {
        try {
            $summary = $this->gradebookService->studentSummary($classId, auth()->id(), $studentId);
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($summary, 'Student grade summary retrieved successfully.');
    }

    public function classSummary(int $classId): JsonResponse
    {
        try {
            $summary = $this->gradebookService->classSummary($classId, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($summary, 'Class grade summary retrieved successfully.');
    }

    public function components(): JsonResponse
    {
        return $this->successResponse(GradebookService::COMPONENTS, 'Grade components retrieved successfully.');
    }
}
