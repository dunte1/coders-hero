<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobApplicationController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = JobApplication::with('jobListing');

        if ($request->filled('job_listing_id')) {
            $query->where('job_listing_id', $request->input('job_listing_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $query->latest();

        return $this->paginatedResponse(
            $query->paginate((int) $request->input('per_page', 20))->withQueryString()
        );
    }

    public function show(int $id): JsonResponse
    {
        $application = JobApplication::with('jobListing')->find($id);

        if (! $application) {
            return $this->notFoundResponse('Job application not found.');
        }

        return $this->successResponse(
            new JobApplicationResource($application),
            'Job application retrieved successfully.'
        );
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $application = JobApplication::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:new,reviewed,shortlisted,rejected,hired'],
        ]);

        $application->update($validated);

        return $this->successResponse(
            new JobApplicationResource($application->fresh()->load('jobListing')),
            'Application status updated.'
        );
    }
}
