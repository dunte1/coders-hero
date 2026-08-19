<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Services\Finance\FinanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private FinanceService $financeService
    ) {}

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->financeService->summary(), 'Finance summary retrieved successfully.');
    }

    public function collections(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->financeService->collections($request->only(['from', 'to', 'method', 'search', 'per_page', 'page'])),
            'Collections retrieved successfully.'
        );
    }

    public function outstanding(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->financeService->outstanding($request->only(['grade', 'search', 'per_page', 'page'])),
            'Outstanding balances retrieved successfully.'
        );
    }

    public function expensesByCategory(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->financeService->expensesByCategory($request->get('fiscal_year')),
            'Expenses by category retrieved successfully.'
        );
    }

    public function transactions(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->financeService->transactions($request->only(['per_page', 'page'])),
            'Transaction history retrieved successfully.'
        );
    }

    public function myOutstanding(): JsonResponse
    {
        $studentIds = $this->financeService->accessibleStudentIds();
        $rows = $this->financeService->outstandingForStudents($studentIds);

        return $this->successResponse($rows, 'Outstanding balance retrieved successfully.');
    }
}
