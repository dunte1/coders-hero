<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Admission;
use App\Services\Students\AdmissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdmissionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AdmissionService $admissionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Admission::class);

        $admissions = $this->admissionService->getAll(
            $request->only(['search', 'status', 'grade']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($admissions, 'Admissions retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Admission::class);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'program_of_interest' => ['nullable', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:100'],
            'preferred_branch' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:new,in_review,approved,admitted,rejected'],
            'applied_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $admission = $this->admissionService->create($validated);

        return $this->createdResponse($admission, 'Admission created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $admission = $this->admissionService->getById($id);

        if (!$admission) {
            return $this->notFoundResponse('Admission not found.');
        }

        $this->authorize('view', $admission);

        return $this->successResponse($admission, 'Admission retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $admission = $this->admissionService->getById($id);

        if (!$admission) {
            return $this->notFoundResponse('Admission not found.');
        }

        $this->authorize('update', $admission);

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'guardian_email' => ['nullable', 'email', 'max:255'],
            'program_of_interest' => ['nullable', 'string', 'max:255'],
            'grade' => ['nullable', 'string', 'max:100'],
            'preferred_branch' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:new,in_review,approved,admitted,rejected'],
            'notes' => ['nullable', 'string'],
        ]);

        $admission = $this->admissionService->update($id, $validated);

        return $this->successResponse($admission, 'Admission updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $admission = $this->admissionService->getById($id);

        if (!$admission) {
            return $this->notFoundResponse('Admission not found.');
        }

        $this->authorize('delete', $admission);

        $this->admissionService->delete($id);

        return $this->noContentResponse('Admission deleted successfully.');
    }

    public function admit(int $id): JsonResponse
    {
        $admission = $this->admissionService->getById($id);

        if (!$admission) {
            return $this->notFoundResponse('Admission not found.');
        }

        $this->authorize('admit', $admission);

        $admission = $this->admissionService->admit($id);

        return $this->successResponse($admission, 'Applicant admitted as student successfully.');
    }

    public function reject(int $id): JsonResponse
    {
        $admission = $this->admissionService->getById($id);

        if (!$admission) {
            return $this->notFoundResponse('Admission not found.');
        }

        $this->authorize('update', $admission);

        $reason = request()->input('reason');

        $admission = $this->admissionService->reject($id, $reason);

        return $this->successResponse($admission, 'Admission rejected.');
    }
}
