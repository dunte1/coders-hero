<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Http\Resources\PositionResource;
use App\Models\Department;
use App\Models\Position;
use App\Services\Hr\HrService;
use App\Services\Pdf\DocumentPdfService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class HrController extends Controller
{
    use ApiResponse;

    public function __construct(
        private HrService $hrService,
        private DocumentPdfService $pdf
    ) {}

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->hrService->summary(), 'HR summary retrieved successfully.');
    }

    public function headcount(Request $request): JsonResponse
    {
        $report = $this->hrService->headcount($request->only(['status', 'department_id']));

        return $this->successResponse($report, 'Headcount report retrieved successfully.');
    }

    public function leaveReport(Request $request): JsonResponse
    {
        $report = $this->hrService->leaveReport($request->only(['status', 'leave_type', 'from', 'to']));

        return $this->successResponse($report, 'Leave report retrieved successfully.');
    }

    public function attendanceReport(Request $request): JsonResponse
    {
        $report = $this->hrService->attendanceReport($request->only(['from', 'to']));

        return $this->successResponse($report, 'Attendance report retrieved successfully.');
    }

    public function payrollReport(Request $request): JsonResponse
    {
        $report = $this->hrService->payrollReport($request->only(['month', 'status']));

        return $this->successResponse($report, 'Payroll report retrieved successfully.');
    }

    public function departments(): JsonResponse
    {
        $departments = Department::with(['positions'])
            ->orderBy('name')
            ->get();

        return $this->successResponse(
            DepartmentResource::collection($departments),
            'Departments retrieved successfully.'
        );
    }

    public function positions(): JsonResponse
    {
        $positions = Position::with(['department'])
            ->orderBy('name')
            ->get();

        return $this->successResponse(
            PositionResource::collection($positions),
            'Positions retrieved successfully.'
        );
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['term' => 'required|string|min:1']);

        $employees = $this->hrService->searchEmployees($request->get('term'));

        return $this->successResponse(
            \App\Http\Resources\Hr\EmployeeHrResource::collection($employees),
            'Employees retrieved successfully.'
        );
    }

    public function exportEmployees(Request $request): StreamedResponse
    {
        $rows = $this->hrService->exportEmployees($request->only(['status', 'department_id']));

        return $this->streamCsv($rows, 'employees', [
            'employee_id' => 'Employee ID',
            'name' => 'Full Name',
            'email' => 'Email',
            'phone' => 'Phone',
            'department' => 'Department',
            'position' => 'Position',
            'employment_type' => 'Employment Type',
            'hire_date' => 'Hire Date',
            'status' => 'Status',
            'salary' => 'Salary',
        ]);
    }

    public function exportLeave(Request $request): StreamedResponse
    {
        $rows = $this->hrService->exportLeave($request->only(['status', 'from', 'to']));

        return $this->streamCsv($rows, 'leave-requests', [
            'employee_id' => 'Employee ID',
            'employee' => 'Employee',
            'leave_type' => 'Leave Type',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'days' => 'Days',
            'reason' => 'Reason',
            'status' => 'Status',
            'reviewed_at' => 'Reviewed At',
        ]);
    }

    public function exportAttendance(Request $request): StreamedResponse
    {
        $rows = $this->hrService->exportAttendance($request->only(['from', 'to']));

        return $this->streamCsv($rows, 'staff-attendance', [
            'employee_id' => 'Employee ID',
            'employee' => 'Employee',
            'department' => 'Department',
            'present' => 'Present',
            'absent' => 'Absent',
            'late' => 'Late',
            'half_day' => 'Half Day',
            'leave' => 'Leave',
            'total' => 'Total',
            'rate' => 'Attendance Rate (%)',
        ]);
    }

    public function exportEmployeesPdf(Request $request): StreamedResponse
    {
        $rows = $this->hrService->exportEmployees($request->only(['status', 'department_id']));

        return $this->streamPdf($rows, 'employees', [
            'employee_id' => 'Employee ID',
            'name' => 'Full Name',
            'email' => 'Email',
            'phone' => 'Phone',
            'department' => 'Department',
            'position' => 'Position',
            'employment_type' => 'Employment Type',
            'hire_date' => 'Hire Date',
            'status' => 'Status',
            'salary' => 'Salary',
        ], 'Staff Export');
    }

    public function exportLeavePdf(Request $request): StreamedResponse
    {
        $rows = $this->hrService->exportLeave($request->only(['status', 'from', 'to']));

        return $this->streamPdf($rows, 'leave-requests', [
            'employee_id' => 'Employee ID',
            'employee' => 'Employee',
            'leave_type' => 'Leave Type',
            'start_date' => 'Start Date',
            'end_date' => 'End Date',
            'days' => 'Days',
            'reason' => 'Reason',
            'status' => 'Status',
            'reviewed_at' => 'Reviewed At',
        ], 'Leave Requests Export');
    }

    public function exportAttendancePdf(Request $request): StreamedResponse
    {
        $rows = $this->hrService->exportAttendance($request->only(['from', 'to']));

        return $this->streamPdf($rows, 'staff-attendance', [
            'employee_id' => 'Employee ID',
            'employee' => 'Employee',
            'department' => 'Department',
            'present' => 'Present',
            'absent' => 'Absent',
            'late' => 'Late',
            'half_day' => 'Half Day',
            'leave' => 'Leave',
            'total' => 'Total',
            'rate' => 'Attendance Rate (%)',
        ], 'Staff Attendance Export');
    }

    private function streamPdf(array $rows, string $prefix, array $headers, string $title): StreamedResponse
    {
        $table = $this->pdf->table(array_values($headers), array_map(
            fn (array $row) => array_map(fn ($key) => $row[$key] ?? '', array_keys($headers)),
            $rows
        ));

        return $this->pdf->download(
            $title,
            $table,
            $prefix . '-' . now()->format('Y-m-d-His') . '.pdf'
        );
    }

    private function streamCsv(array $rows, string $prefix, array $headers): StreamedResponse
    {
        $filename = $prefix . '-' . now()->format('Y-m-d-His') . '.csv';

        return Response::streamDownload(function () use ($rows, $headers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, array_values($headers));

            foreach ($rows as $row) {
                fputcsv($handle, array_map(fn ($key) => $row[$key] ?? '', array_keys($headers)));
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
