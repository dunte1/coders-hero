<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\BulkStaffAttendanceRequest;
use App\Http\Requests\Hr\StoreStaffAttendanceRequest;
use App\Http\Requests\Hr\UpdateStaffAttendanceRequest;
use App\Http\Resources\Hr\StaffAttendanceResource;
use App\Models\StaffAttendance;
use App\Services\Hr\HrService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffAttendanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private HrService $hrService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $attendances = StaffAttendance::query()
            ->with(['employee.user', 'employee.department'])
            ->when($request->get('employee_id'), fn ($q, $id) => $q->where('employee_id', (int) $id))
            ->when($request->get('status'), fn ($q, $s) => $q->byStatus($s))
            ->when($request->get('attendance_date'), fn ($q, $d) => $q->whereDate('attendance_date', $d))
            ->when($request->get('from'), fn ($q, $d) => $q->whereDate('attendance_date', '>=', $d))
            ->when($request->get('to'), fn ($q, $d) => $q->whereDate('attendance_date', '<=', $d))
            ->orderByDesc('attendance_date');

        return $this->paginatedResponse(
            $attendances->paginate((int) $request->get('per_page', 15)),
            'Attendance records retrieved successfully.'
        );
    }

    public function store(StoreStaffAttendanceRequest $request): JsonResponse
    {
        $data = $request->validated();

        $exists = StaffAttendance::where('employee_id', $data['employee_id'])
            ->whereDate('attendance_date', $data['attendance_date'])
            ->first();

        if ($exists) {
            return $this->errorResponse('Attendance for this employee and date already exists.', 422);
        }

        $attendance = StaffAttendance::create([
            ...$data,
            'recorded_by_user_id' => auth()->id(),
        ]);

        return $this->createdResponse(
            new StaffAttendanceResource($attendance->load(['employee.user', 'recordedBy'])),
            'Attendance recorded successfully.'
        );
    }

    public function bulk(BulkStaffAttendanceRequest $request): JsonResponse
    {
        $date = $request->get('attendance_date');
        $records = $request->input('records');

        $created = DB::transaction(function () use ($records, $date) {
            $result = [];
            foreach ($records as $record) {
                $result[] = StaffAttendance::updateOrCreate(
                    [
                        'employee_id' => $record['employee_id'],
                        'attendance_date' => $date,
                    ],
                    [
                        'status' => $record['status'],
                        'check_in' => $record['check_in'] ?? null,
                        'check_out' => $record['check_out'] ?? null,
                        'note' => $record['note'] ?? null,
                        'recorded_by_user_id' => auth()->id(),
                    ]
                );
            }

            return $result;
        });

        return $this->successResponse(
            StaffAttendanceResource::collection(collect($created)->each->load(['employee.user', 'recordedBy'])),
            count($created) . ' attendance records saved successfully.'
        );
    }

    public function update(UpdateStaffAttendanceRequest $request, int $id): JsonResponse
    {
        $attendance = StaffAttendance::find($id);

        if (!$attendance) {
            return $this->notFoundResponse('Attendance record not found.');
        }

        $attendance->update($request->validated());

        return $this->successResponse(
            new StaffAttendanceResource($attendance->load(['employee.user'])),
            'Attendance updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $attendance = StaffAttendance::find($id);

        if (!$attendance) {
            return $this->notFoundResponse('Attendance record not found.');
        }

        $attendance->delete();

        return $this->noContentResponse('Attendance record deleted successfully.');
    }

    public function myAttendance(Request $request): JsonResponse
    {
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && $user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->successResponse(
                [
                    'data' => [],
                    'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0, 'from' => null, 'to' => null],
                ],
                'Attendance records retrieved successfully.'
            );
        }

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their own attendance records.');
        }

        $attendances = StaffAttendance::query()
            ->with('employee.user')
            ->where('employee_id', $employee->id)
            ->when($request->get('from'), fn ($q, $d) => $q->whereDate('attendance_date', '>=', $d))
            ->when($request->get('to'), fn ($q, $d) => $q->whereDate('attendance_date', '<=', $d))
            ->orderByDesc('attendance_date');

        return $this->paginatedResponse(
            $attendances->paginate((int) $request->get('per_page', 15)),
            'Attendance records retrieved successfully.'
        );
    }
}
