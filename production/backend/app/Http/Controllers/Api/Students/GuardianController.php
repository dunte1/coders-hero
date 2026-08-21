<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Guardian;
use App\Services\Students\GuardianService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuardianController extends Controller
{
    use ApiResponse;

    public function __construct(
        private GuardianService $guardianService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Guardian::class);

        $guardians = $this->guardianService->getAll(
            $request->only(['search']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($guardians, 'Guardians retrieved successfully.');
    }

    public function all(): JsonResponse
    {
        $this->authorize('viewAny', Guardian::class);

        return $this->successResponse(
            $this->guardianService->all(),
            'Guardians retrieved successfully.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Guardian::class);

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'relationship' => ['nullable', 'in:parent,guardian,relative,other'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $guardian = $this->guardianService->create($validated);

        return $this->createdResponse($guardian, 'Guardian created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $guardian = $this->guardianService->getById($id);

        if (!$guardian) {
            return $this->notFoundResponse('Guardian not found.');
        }

        $this->authorize('view', $guardian);

        return $this->successResponse($guardian, 'Guardian retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $guardian = $this->guardianService->getById($id);

        if (!$guardian) {
            return $this->notFoundResponse('Guardian not found.');
        }

        $this->authorize('update', $guardian);

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'relationship' => ['nullable', 'in:parent,guardian,relative,other'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $guardian = $this->guardianService->update($id, $validated);

        return $this->successResponse($guardian, 'Guardian updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $guardian = $this->guardianService->getById($id);

        if (!$guardian) {
            return $this->notFoundResponse('Guardian not found.');
        }

        $this->authorize('delete', $guardian);

        $this->guardianService->delete($id);

        return $this->noContentResponse('Guardian deleted successfully.');
    }
}
