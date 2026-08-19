<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\StorePerformanceReviewRequest;
use App\Http\Requests\Hr\UpdatePerformanceReviewRequest;
use App\Http\Resources\Hr\PerformanceReviewResource;
use App\Models\PerformanceReview;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $reviews = PerformanceReview::query()
            ->with(['employee.user', 'employee.department', 'reviewer'])
            ->when($request->get('employee_id'), fn ($q, $id) => $q->where('employee_id', (int) $id))
            ->when($request->get('status'), fn ($q, $s) => $q->byStatus($s))
            ->when($request->get('search'), function ($q, $term) {
                $q->whereHas('employee.user', fn ($u) => $u->where('name', 'like', "%{$term}%"));
            })
            ->orderByDesc('review_date');

        return $this->paginatedResponse(
            $reviews->paginate((int) $request->get('per_page', 15)),
            'Performance reviews retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        $review = PerformanceReview::with(['employee.user', 'employee.department', 'reviewer'])->find($id);

        if (!$review) {
            return $this->notFoundResponse('Performance review not found.');
        }

        return $this->successResponse(
            new PerformanceReviewResource($review),
            'Performance review retrieved successfully.'
        );
    }

    public function store(StorePerformanceReviewRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['reviewer_user_id'])) {
            $data['reviewer_user_id'] = auth()->id();
        }

        $review = PerformanceReview::create($data);

        return $this->createdResponse(
            new PerformanceReviewResource($review->load(['employee.user', 'reviewer'])),
            'Performance review created successfully.'
        );
    }

    public function update(UpdatePerformanceReviewRequest $request, int $id): JsonResponse
    {
        $review = PerformanceReview::find($id);

        if (!$review) {
            return $this->notFoundResponse('Performance review not found.');
        }

        $review->update($request->validated());

        return $this->successResponse(
            new PerformanceReviewResource($review->load(['employee.user', 'reviewer'])),
            'Performance review updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $review = PerformanceReview::find($id);

        if (!$review) {
            return $this->notFoundResponse('Performance review not found.');
        }

        $review->delete();

        return $this->noContentResponse('Performance review deleted successfully.');
    }
}
