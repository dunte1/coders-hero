<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreExpenseRequest;
use App\Http\Requests\Finance\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\Finance\FinanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    use ApiResponse;

    public function __construct(
        private FinanceService $financeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->financeService->expenses($request->only(['category', 'approval_status', 'from', 'to', 'search', 'per_page', 'page'])),
            'Expenses retrieved successfully.'
        );
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $expense = Expense::create(array_merge(
            $request->validated(),
            ['recorded_by_user_id' => auth()->id()]
        ));

        return $this->createdResponse($expense, 'Expense recorded.');
    }

    public function show(int $id): JsonResponse
    {
        $expense = Expense::with('recordedBy:id,name')->find($id);

        if (!$expense) {
            return $this->notFoundResponse('Expense not found.');
        }

        return $this->successResponse($expense, 'Expense retrieved successfully.');
    }

    public function update(UpdateExpenseRequest $request, int $id): JsonResponse
    {
        $expense = Expense::find($id);

        if (!$expense) {
            return $this->notFoundResponse('Expense not found.');
        }

        $expense->update($request->validated());

        return $this->successResponse($expense, 'Expense updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $expense = Expense::find($id);

        if (!$expense) {
            return $this->notFoundResponse('Expense not found.');
        }

        $expense->delete();

        return $this->noContentResponse('Expense deleted.');
    }

    public function approve(int $id): JsonResponse
    {
        $expense = Expense::find($id);

        if (!$expense) {
            return $this->notFoundResponse('Expense not found.');
        }

        $expense->update([
            'approval_status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return $this->successResponse($expense->fresh(['recordedBy', 'submitter', 'approver']), 'Expense approved.');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $expense = Expense::find($id);

        if (!$expense) {
            return $this->notFoundResponse('Expense not found.');
        }

        $expense->update([
            'approval_status' => 'rejected',
            'approved_by' => auth()->id(),
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return $this->successResponse($expense->fresh(['recordedBy', 'submitter', 'approver']), 'Expense rejected.');
    }
}
