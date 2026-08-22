<?php

namespace App\Services\Reports;

use App\Models\GeneratedReport;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Employee;
use App\Models\ContactMessage;
use App\Models\Admission;
use App\Models\Fee;
use App\Services\Pdf\DocumentPdfService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MonthlyReportService
{
    public function __construct(
        private DocumentPdfService $pdfService
    ) {}

    /**
     * Generate a full monthly report bundle as a single branded PDF.
     */
    public function generateMonthlyReport(?int $userId = null): GeneratedReport
    {
        $period = now()->subMonth()->format('Y-m');
        $title = 'Monthly Report - ' . now()->subMonth()->format('F Y');

        $sections = [
            $this->financeSection($period),
            $this->enrollmentSection($period),
            $this->attendanceSection($period),
            $this->hrSection($period),
            $this->admissionsSection($period),
        ];

        $content = implode("\n", array_filter($sections));

        $filename = 'monthly-report-' . $period . '-' . Str::random(8) . '.pdf';
        $directory = 'reports/monthly/' . $period;

        $html = $this->pdfService->branded($title, $content, [
            'document_no' => strtoupper($period),
        ]);

        $path = $directory . '/' . $filename;
        Storage::makeDirectory($directory);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->getDomPDF()->getOptions()->set('isRemoteEnabled', true);
        $pdf->setPaper('a4', 'portrait');
        $pdf->save(storage_path('app/' . $path));

        $fileSize = Storage::size($path);

        return GeneratedReport::create([
            'report_type' => 'monthly',
            'title' => $title,
            'period' => $period,
            'generated_at' => now(),
            'file_path' => $path,
            'file_size' => $fileSize,
            'format' => 'pdf',
            'generated_by' => $userId,
            'metadata' => [
                'sections' => ['finance', 'enrollment', 'attendance', 'hr', 'admissions'],
            ],
        ]);
    }

    private function financeSection(string $period): string
    {
        $start = $period . '-01';
        $end = now()->parse($start)->endOfMonth()->toDateString();

        $totalCollected = Payment::whereBetween('paid_at', [$start, $end])->sum('amount');
        $totalInvoices = Invoice::whereBetween('created_at', [$start, $end])->sum('amount');
        $paidInvoices = Invoice::where('status', 'paid')->whereBetween('paid_at', [$start, $end])->count();
        $totalInvoicesCount = Invoice::whereBetween('created_at', [$start, $end])->count();
        $outstandingBalance = Invoice::whereIn('status', ['issued', 'partial', 'overdue'])->sum(DB::raw('amount - paid_amount'));

        $methodBreakdown = Payment::whereBetween('paid_at', [$start, $end])
            ->select('method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('method')
            ->get();

        $html = '<div class="doc-section">';
        $html .= '<div class="doc-section-title">Finance Summary</div>';
        $html .= $this->pdfService->detailsBox([
            'Period' => now()->parse($start)->format('F Y'),
            'Total Collected' => 'KSh ' . number_format($totalCollected, 2),
            'Total Invoiced' => 'KSh ' . number_format($totalInvoices, 2),
            'Invoices Paid' => $paidInvoices . ' / ' . $totalInvoicesCount,
            'Outstanding Balance' => 'KSh ' . number_format($outstandingBalance, 2),
        ]);

        if ($methodBreakdown->isNotEmpty()) {
            $html .= '<h4 style="margin-top:12px;font-size:11px;">Collections by Method</h4>';
            $html .= $this->pdfService->table(
                ['Method', 'Count', 'Amount'],
                $methodBreakdown->map(fn ($r) => [ucwords(str_replace('_', ' ', $r->method)), $r->count, 'KSh ' . number_format($r->total, 2)])->toArray()
            );
        }

        $html .= '</div>';
        return $html;
    }

    private function enrollmentSection(string $period): string
    {
        $start = $period . '-01';
        $end = now()->parse($start)->endOfMonth()->toDateString();

        $newEnrollments = Enrollment::whereBetween('enrolled_at', [$start, $end])->count();
        $completions = Enrollment::where('status', 'completed')->whereBetween('completed_at', [$start, $end])->count();
        $drops = Enrollment::where('status', 'dropped')->whereBetween('updated_at', [$start, $end])->count();
        $totalActive = Enrollment::where('status', 'active')->count();

        $html = '<div class="doc-section">';
        $html .= '<div class="doc-section-title">Student Enrollment</div>';
        $html .= $this->pdfService->detailsBox([
            'New Enrollments' => $newEnrollments,
            'Completions' => $completions,
            'Dropouts' => $drops,
            'Total Active' => $totalActive,
        ]);
        $html .= '</div>';
        return $html;
    }

    private function attendanceSection(string $period): string
    {
        $html = '<div class="doc-section">';
        $html .= '<div class="doc-section-title">Attendance Summary</div>';
        $html .= '<p class="text-muted">Detailed attendance data is available in the Attendance Report section.</p>';
        $html .= '</div>';
        return $html;
    }

    private function hrSection(string $period): string
    {
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('employment_status', 'active')->count();

        $html = '<div class="doc-section">';
        $html .= '<div class="doc-section-title">HR & Staffing</div>';
        $html .= $this->pdfService->detailsBox([
            'Total Employees' => $totalEmployees,
            'Active Employees' => $activeEmployees,
        ]);
        $html .= '</div>';
        return $html;
    }

    private function admissionsSection(string $period): string
    {
        $start = $period . '-01';
        $end = now()->parse($start)->endOfMonth()->toDateString();

        $total = Admission::whereBetween('applied_at', [$start, $end])->count();
        $admitted = Admission::where('status', 'admitted')->whereBetween('decided_at', [$start, $end])->count();
        $rejected = Admission::where('status', 'rejected')->whereBetween('decided_at', [$start, $end])->count();
        $pending = Admission::whereIn('status', ['new', 'in_review'])->count();

        $html = '<div class="doc-section">';
        $html .= '<div class="doc-section-title">Admissions Pipeline</div>';
        $html .= $this->pdfService->detailsBox([
            'Applications Received' => $total,
            'Admitted' => $admitted,
            'Rejected' => $rejected,
            'Pending Review' => $pending,
        ]);
        $html .= '</div>';
        return $html;
    }
}
