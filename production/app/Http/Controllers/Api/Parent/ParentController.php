<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function summary(): JsonResponse
    {
        $guardian = $this->portalService->guardianForUser();
        $students = $this->portalService->accessibleStudents()
            ->loadCount(['fees as outstanding_fees' => fn ($q) => $q->where('status', 'pending')]);

        return $this->successResponse([
            'guardian' => $guardian,
            'students' => $students,
        ], 'Parent summary retrieved successfully.');
    }

    public function teachers(): JsonResponse
    {
        $teachers = User::role('instructor')
            ->select(['id', 'name', 'email', 'phone', 'avatar'])
            ->orderBy('name')
            ->get();

        return $this->successResponse($teachers, 'Teachers retrieved successfully.');
    }

    public function children(Request $request): JsonResponse
    {
        $students = $this->portalService->accessibleStudents(null, $request->only(['grade', 'status']));

        return $this->successResponse($students, 'Children retrieved successfully.');
    }
}
