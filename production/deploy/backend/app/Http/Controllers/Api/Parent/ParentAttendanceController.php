<?php

namespace App\Http\Controllers\Api\Parent;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\Parents\ParentPortalService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ParentAttendanceController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ParentPortalService $portalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $students = $this->portalService->accessibleStudents();
        $month = $request->get('month');
        $date = $month ? Carbon::parse($month . '-01') : now();

        $from = $date->copy()->startOfMonth()->toDateString();
        $to = $date->copy()->endOfMonth()->toDateString();

        $result = $students->map(function ($student) use ($from, $to) {
            $records = Attendance::forStudent($student->id)
                ->whereDate('attendance_date', '>=', $from)
                ->whereDate('attendance_date', '<=', $to)
                ->orderBy('attendance_date', 'desc')
                ->get();

            return [
                'student' => $student->only(['id', 'student_id', 'first_name', 'last_name', 'full_name', 'grade', 'branch', 'status', 'photo_url']),
                'month' => $from ? substr($from, 0, 7) : null,
                'summary' => [
                    'present' => $records->whereIn('status', ['present', 'late'])->count(),
                    'late' => $records->where('status', 'late')->count(),
                    'absent' => $records->where('status', 'absent')->count(),
                    'excused' => $records->where('status', 'excused')->count(),
                    'total' => $records->count(),
                ],
                'records' => $records,
            ];
        });

        return $this->successResponse([
            'month' => $date->format('Y-m'),
            'children' => $result,
        ], 'Attendance retrieved successfully.');
    }
}
