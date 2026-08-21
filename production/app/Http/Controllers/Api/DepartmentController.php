<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $departments = Department::with(['manager', 'parent', 'children', 'positions'])
            ->whereNull('parent_id')
            ->with('children')
            ->get();

        return $this->successResponse(
            DepartmentResource::collection($departments),
            'Departments retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'manager_id' => ['nullable', 'string', 'exists:users,id'],
            'parent_id' => ['nullable', 'integer', 'exists:departments,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $department = Department::create($validated);

        return $this->createdResponse(
            new DepartmentResource($department->load(['manager', 'parent'])),
            'Department created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $department = Department::with(['manager', 'parent', 'children', 'positions', 'employees.user'])->find($id);

        if (!$department) {
            return $this->notFoundResponse('Department not found.');
        }

        return $this->successResponse(
            new DepartmentResource($department),
            'Department retrieved successfully.'
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'manager_id' => ['nullable', 'string', 'exists:users,id'],
            'parent_id' => ['nullable', 'integer', 'exists:departments,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $department->update($validated);

        return $this->successResponse(
            new DepartmentResource($department->fresh()->load(['manager', 'parent'])),
            'Department updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $department = Department::findOrFail($id);
        $department->delete();

        return $this->noContentResponse('Department deleted successfully.');
    }
}
