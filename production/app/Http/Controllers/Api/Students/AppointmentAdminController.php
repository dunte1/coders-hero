<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentAdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $appointments = Appointment::with(['student', 'teacher', 'guardian'])
            ->when($request->get('status') && $request->get('status') !== 'all', function ($query) use ($request) {
                return $query->where('status', $request->get('status'));
            })
            ->orderByDesc('scheduled_at')
            ->paginate((int) $request->get('per_page', 20));

        return $this->paginatedResponse($appointments, 'Appointments retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $appointment = Appointment::with(['student', 'teacher'])->find($id);

        if (!$appointment) {
            return $this->notFoundResponse('Appointment not found.');
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:pending,confirmed,completed,cancelled'],
            'scheduled_at' => ['sometimes', 'date'],
            'teacher_user_id' => ['sometimes', 'string', 'exists:users,id'],
            'reason' => ['sometimes', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $appointment->update($validated);

        return $this->successResponse($appointment, 'Appointment updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return $this->notFoundResponse('Appointment not found.');
        }

        $appointment->delete();

        return $this->noContentResponse('Appointment deleted successfully.');
    }
}
