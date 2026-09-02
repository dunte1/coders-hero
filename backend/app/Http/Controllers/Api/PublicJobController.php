<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobListingResource;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PublicJobController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = JobListing::published()->withCount('applications');

        if ($request->filled('department')) {
            $query->where('department', $request->input('department'));
        }

        if ($request->filled('location')) {
            $query->where('location', $request->input('location'));
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
            $query->paginate((int) $request->input('per_page', 12))->withQueryString()
        );
    }

    public function show(int $id): JsonResponse
    {
        $job = JobListing::published()->withCount('applications')->find($id);

        if (! $job) {
            return $this->notFoundResponse('Job listing not found.');
        }

        return $this->successResponse(new JobListingResource($job), 'Job listing retrieved successfully.');
    }

    public function apply(Request $request, int $id): JsonResponse
    {
        $job = JobListing::published()->find($id);

        if (! $job) {
            return $this->notFoundResponse('Job listing not found.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'resume' => ['nullable', 'file', 'max:10240', 'mimes:pdf,doc,docx'],
            'cover_letter' => ['nullable', 'string'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
        ]);

        $resumePath = null;
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
        }

        $application = JobApplication::create([
            'job_listing_id' => $job->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'resume_path' => $resumePath,
            'cover_letter' => $validated['cover_letter'] ?? null,
            'portfolio_url' => $validated['portfolio_url'] ?? null,
        ]);

        return $this->createdResponse(
            ['id' => $application->id],
            'Application submitted successfully.'
        );
    }
}
