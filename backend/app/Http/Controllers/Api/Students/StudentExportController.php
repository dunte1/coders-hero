<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Services\Pdf\DocumentPdfService;
use App\Services\Students\AttendanceService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentExportController extends Controller
{
    use ApiResponse;

    private const MAX_EXPORT_ROWS = 10000;

    public function __construct(
        private AttendanceService $attendanceService,
        private DocumentPdfService $pdf
    ) {}

    public function students(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::query()
            ->with('guardian')
            ->search($request->get('search'))
            ->byStatus($request->get('status'))
            ->byGrade($request->get('grade'))
            ->orderBy('student_id');

        $filename = 'students-' . now()->format('Y-m-d-His') . '.csv';

        return Response::streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Student ID',
                'Full Name',
                'Gender',
                'Date of Birth',
                'Age',
                'Grade',
                'Branch',
                'Guardian',
                'Guardian Phone',
                'Status',
                'Admission Date',
                'Graduation Date',
            ]);

            $count = 0;
            $query->chunk(500, function ($students) use ($handle, &$count) {
                foreach ($students as $student) {
                    if ($count >= self::MAX_EXPORT_ROWS) return;
                    fputcsv($handle, [
                        $student->student_id,
                        $student->full_name,
                        $student->gender ?? '',
                        $student->date_of_birth?->format('Y-m-d') ?? '',
                        $student->age ?? '',
                        $student->grade ?? '',
                        $student->branch ?? '',
                        $student->guardian?->full_name ?? '',
                        $student->guardian?->phone ?? '',
                        $student->status,
                        $student->admission_date?->format('Y-m-d') ?? '',
                        $student->graduation_date?->format('Y-m-d') ?? '',
                    ]);
                    $count++;
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function attendance(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', \App\Models\Attendance::class);

        $report = $this->attendanceService->report($request->only(['from', 'to', 'search', 'status', 'grade']));

        $filename = 'attendance-' . $report['from'] . '-to-' . $report['to'] . '.csv';

        return Response::streamDownload(function () use ($report) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Student ID',
                'Student',
                'Grade',
                'Guardian',
                'Present',
                'Late',
                'Absent',
                'Excused',
                'Records',
                'Attendance Rate (%)',
            ]);

            foreach ($report['students'] as $row) {
                fputcsv($handle, [
                    $row['student_code'],
                    $row['student'],
                    $row['grade'] ?? '',
                    $row['guardian'] ?? '',
                    $row['present'],
                    $row['late'],
                    $row['absent'],
                    $row['excused'],
                    $row['total'],
                    $row['rate'],
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function studentsPdf(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Student::class);

        $rows = [];
        Student::query()
            ->with('guardian')
            ->search($request->get('search'))
            ->byStatus($request->get('status'))
            ->byGrade($request->get('grade'))
            ->orderBy('student_id')
            ->chunk(500, function ($students) use (&$rows) {
                foreach ($students as $student) {
                    $rows[] = [
                        $student->student_id,
                        $student->full_name,
                        $student->gender ?? '',
                        $student->date_of_birth?->format('Y-m-d') ?? '',
                        $student->age ?? '',
                        $student->grade ?? '',
                        $student->branch ?? '',
                        $student->guardian?->full_name ?? '',
                        $student->guardian?->phone ?? '',
                        $student->status,
                        $student->admission_date?->format('Y-m-d') ?? '',
                        $student->graduation_date?->format('Y-m-d') ?? '',
                    ];
                }
            });

        $content = $this->pdf->table(
            ['Student ID', 'Full Name', 'Gender', 'Date of Birth', 'Age', 'Grade', 'Branch', 'Guardian', 'Guardian Phone', 'Status', 'Admission Date', 'Graduation Date'],
            $rows
        );

        return $this->pdf->download(
            'Students Export',
            $content,
            'students-' . now()->format('Y-m-d-His') . '.pdf'
        );
    }

    public function attendancePdf(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', \App\Models\Attendance::class);

        $report = $this->attendanceService->report($request->only(['from', 'to', 'search', 'status', 'grade']));

        $rows = collect($report['students'])->map(fn (array $row) => [
            $row['student_code'],
            $row['student'],
            $row['grade'] ?? '',
            $row['guardian'] ?? '',
            $row['present'],
            $row['late'],
            $row['absent'],
            $row['excused'],
            $row['total'],
            $row['rate'],
        ])->all();

        $content = $this->pdf->table(
            ['Student ID', 'Student', 'Grade', 'Guardian', 'Present', 'Late', 'Absent', 'Excused', 'Records', 'Attendance Rate (%)'],
            $rows
        );

        return $this->pdf->download(
            'Attendance Report',
            $content,
            'attendance-' . $report['from'] . '-to-' . $report['to'] . '.pdf',
            ['document_no' => $report['from'] . ' to ' . $report['to']]
        );
    }
}
