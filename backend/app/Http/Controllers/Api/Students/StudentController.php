<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\Students\StudentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StudentService $studentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        $students = $this->studentService->getAll(
            $request->only(['search', 'status', 'grade', 'branch', 'guardian_id']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse($students, 'Students retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Student::class);

        $validated = $request->validate([
            'guardian_id' => ['nullable', 'integer', 'exists:guardians,id'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'photo' => ['nullable', 'string', 'max:4000'],
            'grade' => ['nullable', 'string', 'max:100'],
            'branch' => ['nullable', 'string', 'max:255'],
            'admission_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:pending,active,suspended,withdrawn,transferred,graduated'],
            'medical_notes' => ['nullable', 'string'],
        ]);

        $student = $this->studentService->create($validated);

        return $this->createdResponse($student, 'Student created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        return $this->successResponse($student, 'Student retrieved successfully.');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'guardian_id' => ['nullable', 'integer', 'exists:guardians,id'],
            'user_id' => ['nullable', 'string', 'exists:users,id'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'photo' => ['nullable', 'string', 'max:4000'],
            'grade' => ['nullable', 'string', 'max:100'],
            'branch' => ['nullable', 'string', 'max:255'],
            'admission_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:pending,active,suspended,withdrawn,transferred,graduated'],
            'medical_notes' => ['nullable', 'string'],
        ]);

        $student = $this->studentService->update($id, $validated);

        return $this->successResponse($student, 'Student updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('delete', $student);

        $this->studentService->delete($id);

        return $this->noContentResponse('Student deleted successfully.');
    }

    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('uploadPhoto', $student);

        $validated = $request->validate([
            'photo' => ['required'],
        ]);

        $photo = $request->file('photo') ?? $validated['photo'];

        $student = $this->studentService->uploadPhoto($student, $photo);

        return $this->successResponse($student, 'Photo uploaded successfully.');
    }

    public function promote(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('promote', $student);

        $validated = $request->validate([
            'new_grade' => ['nullable', 'string', 'max:100'],
        ]);

        $student = $this->studentService->promote($student, $validated['new_grade'] ?? null);

        return $this->successResponse($student, 'Student promoted successfully.');
    }

    public function transfer(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('transfer', $student);

        $validated = $request->validate([
            'branch' => ['required', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $student = $this->studentService->transfer($student, $validated['branch'], $validated['note'] ?? null);

        return $this->successResponse($student, 'Student transferred successfully.');
    }

    public function graduate(Request $request, int $id): JsonResponse
    {
        $student = $this->studentService->getById($id);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('graduate', $student);

        $validated = $request->validate([
            'graduation_date' => ['nullable', 'date'],
        ]);

        $student = $this->studentService->graduate($student, $validated['graduation_date'] ?? null);

        return $this->successResponse($student, 'Student graduated successfully.');
    }

    public function overview(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        return $this->successResponse(
            $this->studentService->overview(),
            'Student overview retrieved successfully.'
        );
    }

    public function grades(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        return $this->successResponse(
            $this->studentService->distinctGrades(),
            'Student grades retrieved successfully.'
        );
    }

    public function branches(): JsonResponse
    {
        $this->authorize('viewAny', Student::class);

        return $this->successResponse(
            $this->studentService->distinctBranches(),
            'Student branches retrieved successfully.'
        );
    }
}
