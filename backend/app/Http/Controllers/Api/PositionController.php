<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PositionResource;
use App\Models\Position;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Position::with(['department', 'employees']);

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('level')) {
            $query->where('level', $request->level);
        }

        $positions = $query->get();

        return $this->successResponse(
            PositionResource::collection($positions),
            'Positions retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'level' => ['required', 'string', 'in:entry,mid,senior,lead,manager,director,executive'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $position = Position::create($validated);

        return $this->createdResponse(
            new PositionResource($position->load('department')),
            'Position created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $position = Position::with(['department', 'employees.user'])->find($id);

        if (!$position) {
            return $this->notFoundResponse('Position not found.');
        }

        return $this->successResponse(
            new PositionResource($position),
            'Position retrieved successfully.'
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $position = Position::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'level' => ['sometimes', 'string', 'in:entry,mid,senior,lead,manager,director,executive'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $position->update($validated);

        return $this->successResponse(
            new PositionResource($position->fresh()->load('department')),
            'Position updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $position = Position::findOrFail($id);
        $position->delete();

        return $this->noContentResponse('Position deleted successfully.');
    }
}
