<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Guardian;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentAppointmentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function index(): JsonResponse
    {
        $guardian = $this->portalService->guardianForUser();

        if (!$guardian) {
            return $this->successResponse([], 'Appointments retrieved successfully.');
        }

        $appointments = Appointment::with(['student', 'teacher'])
            ->where('guardian_id', $guardian->id)
            ->orderByDesc('scheduled_at')
            ->get();

        return $this->successResponse($appointments, 'Appointments retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $guardian = $this->portalService->guardianForUser();

        if (!$guardian) {
            return $this->forbiddenResponse('No guardian profile linked to this account.');
        }

        $validated = $request->validate([
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'teacher_user_id' => ['required', 'string', 'exists:users,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:120'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        if (!empty($validated['student_id']) && !$this->portalService->hasAccessToStudent($validated['student_id'])) {
            return $this->forbiddenResponse('You do not have access to this student.');
        }

        $appointment = Appointment::create(array_merge($validated, [
            'guardian_id' => $guardian->id,
            'duration_minutes' => $validated['duration_minutes'] ?? 30,
            'status' => 'pending',
        ]));

        return $this->createdResponse($appointment->load(['student', 'teacher']), 'Appointment booked successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $guardian = $this->portalService->guardianForUser();
        $appointment = $guardian?->appointments()->find($id);

        if (!$appointment) {
            return $this->notFoundResponse('Appointment not found.');
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,confirmed,cancelled'],
            'scheduled_at' => ['sometimes', 'date', 'after:now'],
            'reason' => ['sometimes', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        if (!empty($validated['status'])) {
            $validated['status'] = $validated['status'] === 'confirmed' ? 'confirmed' : 'cancelled';
        }

        $appointment->update($validated);

        return $this->successResponse($appointment->load(['student', 'teacher']), 'Appointment updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $guardian = $this->portalService->guardianForUser();
        $appointment = $guardian?->appointments()->find($id);

        if (!$appointment) {
            return $this->notFoundResponse('Appointment not found.');
        }

        $appointment->delete();

        return $this->noContentResponse('Appointment cancelled successfully.');
    }
}
