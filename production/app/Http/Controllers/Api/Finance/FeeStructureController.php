<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreFeeStructureRequest;
use App\Http\Requests\Finance\UpdateFeeStructureRequest;
use App\Models\FeeStructure;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeeStructureController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $structures = FeeStructure::query()
            ->with('createdBy:id,name')
            ->when(($request->get('fee_type')) && ($request->get('fee_type') !== 'all'), fn ($q, $v) => $q->where('fee_type', $v))
            ->when(($request->get('is_active')) !== null && $request->get('is_active') !== 'all', fn ($q, $v) => $q->where('is_active', $v === 'true' || $v === '1'))
            ->when($request->get('search'), fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->orderByDesc('created_at')
            ->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($structures, 'Fee structures retrieved successfully.');
    }

    public function store(StoreFeeStructureRequest $request): JsonResponse
    {
        $structure = FeeStructure::create(array_merge(
            $request->validated(),
            ['created_by_user_id' => auth()->id()]
        ));

        return $this->createdResponse($structure, 'Fee structure created.');
    }

    public function show(int $id): JsonResponse
    {
        $structure = FeeStructure::with(['createdBy:id,name', 'invoices'])->find($id);

        if (!$structure) {
            return $this->notFoundResponse('Fee structure not found.');
        }

        return $this->successResponse($structure, 'Fee structure retrieved successfully.');
    }

    public function update(UpdateFeeStructureRequest $request, int $id): JsonResponse
    {
        $structure = FeeStructure::find($id);

        if (!$structure) {
            return $this->notFoundResponse('Fee structure not found.');
        }

        $structure->update($request->validated());

        return $this->successResponse($structure, 'Fee structure updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $structure = FeeStructure::find($id);

        if (!$structure) {
            return $this->notFoundResponse('Fee structure not found.');
        }

        if ($structure->invoices()->exists()) {
            return $this->errorResponse('Fee structures with generated invoices cannot be deleted.', 422);
        }

        $structure->delete();

        return $this->noContentResponse('Fee structure deleted.');
    }
}
