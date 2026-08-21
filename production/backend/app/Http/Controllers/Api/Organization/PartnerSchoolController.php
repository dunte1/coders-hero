<?php

namespace App\Http\Controllers\Api\Organization;

use App\Http\Controllers\Controller;
use App\Models\PartnerSchool;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerSchoolController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = PartnerSchool::query()
            ->search($request->string('search')->toString())
            ->latest();

        if ($request->filled('partnership_type')) {
            $query->where('partnership_type', $request->string('partnership_type'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $schools = $query->paginate((int) $request->get('per_page', 15));

        return $this->paginatedResponse($schools);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'partnership_type' => 'sometimes|in:feeder,sibling,affiliate,other',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $school = PartnerSchool::create($validated);

        return $this->createdResponse($school, 'Partner school created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $school = PartnerSchool::find($id);

        if (! $school) {
            return $this->notFoundResponse('Partner school not found.');
        }

        return $this->successResponse($school);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $school = PartnerSchool::find($id);

        if (! $school) {
            return $this->notFoundResponse('Partner school not found.');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'partnership_type' => 'sometimes|in:feeder,sibling,affiliate,other',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $school->update($validated);

        return $this->successResponse($school, 'Partner school updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $school = PartnerSchool::find($id);

        if (! $school) {
            return $this->notFoundResponse('Partner school not found.');
        }

        $school->delete();

        return $this->noContentResponse('Partner school deleted successfully.');
    }

    public function all(): JsonResponse
    {
        $schools = PartnerSchool::active()->orderBy('name')->get(['id', 'name', 'city']);

        return $this->successResponse($schools, 'Partner schools retrieved successfully.');
    }
}
