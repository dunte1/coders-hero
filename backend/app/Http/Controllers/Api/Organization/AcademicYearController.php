<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = AcademicYear::query()
            ->search($request->string('search')->toString())
            ->latest('start_date');

        if ($request->filled('is_current')) {
            $query->where('is_current', $request->boolean('is_current'));
        }

        $years = $query->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($years);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'is_current' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->update(['is_current' => false]);
        }

        $year = AcademicYear::create($validated);

        return $this->createdResponse($year, 'Academic year created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (! $year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        return $this->successResponse($year);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (! $year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'is_current' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validated['is_current'] ?? false) {
            AcademicYear::where('is_current', true)->where('id', '!=', $id)->update(['is_current' => false]);
        }

        $year->update($validated);

        return $this->successResponse($year, 'Academic year updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (! $year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        $year->delete();

        return $this->noContentResponse('Academic year deleted successfully.');
    }

    public function current(): JsonResponse
    {
        $year = AcademicYear::current()->first();

        if (! $year) {
            return $this->notFoundResponse('No current academic year set.');
        }

        return $this->successResponse($year);
    }

    public function setCurrent(int $id): JsonResponse
    {
        $year = AcademicYear::find($id);

        if (! $year) {
            return $this->notFoundResponse('Academic year not found.');
        }

        AcademicYear::where('is_current', true)->update(['is_current' => false]);
        $year->update(['is_current' => true]);

        return $this->successResponse($year, 'Academic year set as current.');
    }
}
