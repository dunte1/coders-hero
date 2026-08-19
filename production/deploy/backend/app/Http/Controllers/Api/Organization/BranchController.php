<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Branch::query()
            ->search($request->string('search')->toString())
            ->latest();

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $branches = $query->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($branches);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:branches,code',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'principal_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $branch = Branch::create($validated);

        return $this->createdResponse($branch, 'Branch created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $branch = Branch::find($id);

        if (! $branch) {
            return $this->notFoundResponse('Branch not found.');
        }

        return $this->successResponse($branch);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $branch = Branch::find($id);

        if (! $branch) {
            return $this->notFoundResponse('Branch not found.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:branches,code,' . $id,
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'principal_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $branch->update($validated);

        return $this->successResponse($branch, 'Branch updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $branch = Branch::find($id);

        if (! $branch) {
            return $this->notFoundResponse('Branch not found.');
        }

        $branch->delete();

        return $this->noContentResponse('Branch deleted successfully.');
    }

    public function all(): JsonResponse
    {
        $branches = Branch::active()->orderBy('name')->get(['id', 'name', 'code', 'city']);

        return $this->successResponse($branches, 'Branches retrieved successfully.');
    }
}
