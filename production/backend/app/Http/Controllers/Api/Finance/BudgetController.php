<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreBudgetRequest;
use App\Http\Requests\Finance\UpdateBudgetRequest;
use App\Models\Budget;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $budgets = Budget::query()
            ->when($request->get('fiscal_year'), fn ($q, $v) => $q->where('fiscal_year', (int) $v))
            ->when($request->get('category'), fn ($q, $v) => $q->where('category', $v))
            ->orderByDesc('fiscal_year')
            ->orderBy('category')
            ->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($budgets, 'Budgets retrieved successfully.');
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $exists = Budget::where('category', $request->input('category'))
            ->where('fiscal_year', (int) $request->input('fiscal_year'))
            ->exists();

        if ($exists) {
            return $this->errorResponse('A budget for this category and year already exists.', 422);
        }

        $budget = Budget::create($request->validated());

        return $this->createdResponse($budget, 'Budget created.');
    }

    public function show(int $id): JsonResponse
    {
        $budget = Budget::find($id);

        if (!$budget) {
            return $this->notFoundResponse('Budget not found.');
        }

        return $this->successResponse($budget, 'Budget retrieved successfully.');
    }

    public function update(UpdateBudgetRequest $request, int $id): JsonResponse
    {
        $budget = Budget::find($id);

        if (!$budget) {
            return $this->notFoundResponse('Budget not found.');
        }

        $budget->update($request->validated());

        return $this->successResponse($budget, 'Budget updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $budget = Budget::find($id);

        if (!$budget) {
            return $this->notFoundResponse('Budget not found.');
        }

        $budget->delete();

        return $this->noContentResponse('Budget deleted.');
    }
}
