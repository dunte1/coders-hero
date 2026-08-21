<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\Student;
use App\Services\Students\MedicalRecordService;
use App\Services\Students\StudentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    use ApiResponse;

    public function __construct(
        private MedicalRecordService $medicalRecordService,
        private StudentService $studentService
    ) {}

    public function show(int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        $medical = $this->medicalRecordService->getForStudent($studentId);

        if (!$medical) {
            return $this->notFoundResponse('No medical record for this student yet.');
        }

        return $this->successResponse($medical, 'Medical record retrieved successfully.');
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $this->validateMedical($request);

        $medical = $this->medicalRecordService->store($student, $validated);

        return $this->createdResponse($medical, 'Medical record saved successfully.');
    }

    public function update(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $this->validateMedical($request);

        $medical = $this->medicalRecordService->update($student, $validated);

        return $this->successResponse($medical, 'Medical record updated successfully.');
    }

    public function destroy(int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $this->medicalRecordService->delete($studentId);

        return $this->noContentResponse('Medical record deleted successfully.');
    }

    private function validateMedical(Request $request): array
    {
        return $request->validate([
            'blood_type' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-,unknown'],
            'height_cm' => ['nullable', 'numeric', 'min:0', 'max:300'],
            'weight_kg' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'allergies' => ['nullable', 'array'],
            'allergies.*' => ['string', 'max:255'],
            'conditions' => ['nullable', 'array'],
            'conditions.*' => ['string', 'max:255'],
            'medications' => ['nullable', 'array'],
            'medications.*' => ['string', 'max:255'],
            'dietary_restrictions' => ['nullable', 'array'],
            'dietary_restrictions.*' => ['string', 'max:255'],
            'doctor_name' => ['nullable', 'string', 'max:255'],
            'doctor_phone' => ['nullable', 'string', 'max:50'],
            'insurance_provider' => ['nullable', 'string', 'max:255'],
            'insurance_policy_number' => ['nullable', 'string', 'max:255'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
