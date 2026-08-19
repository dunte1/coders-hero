<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Controller;
use App\Services\Teachers\TeacherReportService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TeacherReportService $reportService
    ) {}

    public function classReport(Request $request, int $classId): JsonResponse
    {
        try {
            $report = $this->reportService->classReport(
                $classId,
                auth()->id(),
                $request->only(['from', 'to'])
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($report, 'Class report retrieved successfully.');
    }

    public function studentReport(Request $request, int $classId, int $studentId): JsonResponse
    {
        try {
            $report = $this->reportService->studentReport(
                $classId,
                $studentId,
                auth()->id(),
                $request->only(['from', 'to'])
            );
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($report, 'Student report retrieved successfully.');
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->reportService->teacherSummary(auth()->id(), $request->only(['from', 'to'])),
            'Teacher report summary retrieved successfully.'
        );
    }
}
