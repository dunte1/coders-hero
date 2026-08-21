<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\ReportCard;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ParentReportCardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function index(): JsonResponse
    {
        $studentIds = $this->portalService->accessibleStudentIds();

        $reportCards = ReportCard::with(['student', 'items'])
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('issued_at')
            ->get();

        return $this->successResponse($reportCards, 'Report cards retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $studentIds = $this->portalService->accessibleStudentIds();

        $reportCard = ReportCard::with(['student', 'items'])
            ->whereIn('student_id', $studentIds)
            ->find($id);

        if (!$reportCard) {
            return $this->notFoundResponse('Report card not found.');
        }

        return $this->successResponse($reportCard, 'Report card retrieved successfully.');
    }
}
