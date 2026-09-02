<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobListingResource;
use App\Models\JobListing;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobListingController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = JobListing::withCount('applications');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->input('employment_type'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $query->latest();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['sometimes', 'in:full_time,part_time,contract,internship'],
            'description' => ['required', 'string'],
            'requirements' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:draft,published,closed'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $job = JobListing::create($validated);

        return $this->createdResponse(
            new JobListingResource($job),
            'Job listing created successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $job = JobListing::withCount('applications')->find($id);

        if (! $job) {
            return $this->notFoundResponse('Job listing not found.');
        }

        return $this->successResponse(new JobListingResource($job), 'Job listing retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $job = JobListing::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['sometimes', 'in:full_time,part_time,contract,internship'],
            'description' => ['sometimes', 'string'],
            'requirements' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:draft,published,closed'],
            'is_featured' => ['nullable', 'boolean'],
        ]);

        $job->update($validated);

        return $this->successResponse(
            new JobListingResource($job->fresh()),
            'Job listing updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        JobListing::findOrFail($id)->delete();

        return $this->noContentResponse('Job listing deleted successfully.');
    }

    public function toggleFeatured(int $id): JsonResponse
    {
        $job = JobListing::findOrFail($id);
        $job->update(['is_featured' => ! $job->is_featured]);

        return $this->successResponse(
            new JobListingResource($job->fresh()),
            'Job listing featured status updated.'
        );
    }
}
