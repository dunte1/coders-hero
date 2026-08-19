<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ParentFeeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function index(): JsonResponse
    {
        $studentIds = $this->portalService->accessibleStudentIds();

        $fees = Fee::with(['student', 'payments'])
            ->whereIn('student_id', $studentIds)
            ->orderByDesc('due_date')
            ->get();

        return $this->successResponse($fees, 'Fees retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $studentIds = $this->portalService->accessibleStudentIds();

        $fee = Fee::with(['student', 'payments'])
            ->whereIn('student_id', $studentIds)
            ->find($id);

        if (!$fee) {
            return $this->notFoundResponse('Fee not found.');
        }

        return $this->successResponse($fee, 'Fee retrieved successfully.');
    }
}
