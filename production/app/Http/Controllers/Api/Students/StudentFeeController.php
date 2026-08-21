<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentFeeController extends Controller
{
    use ApiResponse;

    public function index(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        return $this->successResponse(
            $student->fees()->with('payments')->get(),
            'Fees retrieved successfully.'
        );
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $student = Student::find($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['required', 'date'],
            'status' => ['nullable', 'in:pending,paid,waived'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $fee = $student->fees()->create([
            'label' => $validated['label'],
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'] ?? 'pending',
            'note' => $validated['note'] ?? null,
        ]);

        return $this->createdResponse($fee, 'Fee created successfully.');
    }

    public function update(Request $request, int $feeId): JsonResponse
    {
        $fee = Fee::with('student')->find($feeId);

        if (!$fee) {
            return $this->notFoundResponse('Fee not found.');
        }

        $this->authorize('update', $fee->student);

        $validated = $request->validate([
            'label' => ['sometimes', 'string', 'max:120'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'due_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:pending,paid,waived'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $fee->update($validated);

        return $this->successResponse($fee->load('payments'), 'Fee updated successfully.');
    }

    public function destroy(int $feeId): JsonResponse
    {
        $fee = Fee::with('student')->find($feeId);

        if (!$fee) {
            return $this->notFoundResponse('Fee not found.');
        }

        $this->authorize('update', $fee->student);

        $fee->delete();

        return $this->noContentResponse('Fee deleted successfully.');
    }
}
