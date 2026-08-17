<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\Notifications\NotificationDispatcher;
use App\Services\Students\AttendanceService;
use App\Services\Students\StudentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AttendanceService $attendanceService,
        private StudentService $studentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Attendance::class);

        $records = $this->attendanceService->getAll(
            $request->only(['date', 'student_id', 'status']),
            (int) $request->get('per_page', 30)
        );

        return $this->paginatedResponse($records, 'Attendance retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Attendance::class);

        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'attendance_date' => ['required', 'date'],
            'status' => ['required', 'in:present,absent,late,excused'],
            'check_in' => ['nullable', 'date_format:H:i'],
            'check_out' => ['nullable', 'date_format:H:i'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $student = $this->studentService->getById($validated['student_id']);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $attendance = $this->attendanceService->recordForStudent(
            $student,
            $validated['attendance_date'],
            $validated['status'],
            $validated['check_in'] ?? null,
            $validated['check_out'] ?? null,
            $validated['note'] ?? null
        );

        $this->notifyStudent($student, $attendance);

        return $this->createdResponse($attendance, 'Attendance recorded successfully.');
    }

    private function notifyStudent($student, $attendance): void
    {
        $user = $student?->user;

        if (!$user) {
            return;
        }

        app(NotificationDispatcher::class)->notify(
            $user,
            'attendance.alert',
            [
                'title' => 'Attendance marked: ' . ucfirst($attendance->status),
                'user_name' => $user->name ?? 'there',
                'student_name' => $student->full_name ?? 'your student',
                'status' => ucfirst($attendance->status),
                'date' => $attendance->attendance_date instanceof \Carbon\Carbon
                    ? $attendance->attendance_date->format('M j, Y')
                    : ($attendance->attendance_date ?? now()->format('M j, Y')),
            ]
        );
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $this->authorize('create', Attendance::class);

        $validated = $request->validate([
            'attendance_date' => ['required', 'date'],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'entries.*.status' => ['required', 'in:present,absent,late,excused'],
            'entries.*.check_in' => ['nullable', 'date_format:H:i'],
            'entries.*.check_out' => ['nullable', 'date_format:H:i'],
            'entries.*.note' => ['nullable', 'string', 'max:500'],
        ]);

        $records = $this->attendanceService->bulkRecord(
            $validated['entries'],
            $validated['attendance_date']
        );

        return $this->createdResponse(
            $records,
            count($records) . ' attendance record(s) saved successfully.'
        );
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return $this->notFoundResponse('Attendance record not found.');
        }

        $this->authorize('update', $attendance);

        $validated = $request->validate([
            'status' => ['sometimes', 'in:present,absent,late,excused'],
            'attendance_date' => ['sometimes', 'date'],
            'check_in' => ['nullable', 'date_format:H:i'],
            'check_out' => ['nullable', 'date_format:H:i'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $attendance = $this->attendanceService->update($id, $validated);

        return $this->successResponse($attendance, 'Attendance updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $attendance = Attendance::find($id);

        if (!$attendance) {
            return $this->notFoundResponse('Attendance record not found.');
        }

        $this->authorize('delete', $attendance);

        $this->attendanceService->delete($id);

        return $this->noContentResponse('Attendance record deleted successfully.');
    }

    public function student(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        $records = $this->attendanceService->forStudent(
            $studentId,
            $request->only(['from', 'to', 'status']),
            (int) $request->get('per_page', 30)
        );

        return $this->paginatedResponse($records, 'Attendance retrieved successfully.');
    }

    public function monthly(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        $request->validate([
            'month' => ['nullable', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        return $this->successResponse(
            $this->attendanceService->monthlySummary($studentId, $request->get('month')),
            'Monthly attendance summary retrieved successfully.'
        );
    }

    public function report(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Attendance::class);

        $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        return $this->successResponse(
            $this->attendanceService->report($request->only(['from', 'to', 'search', 'status', 'grade'])),
            'Attendance report generated successfully.'
        );
    }
}
