<?php

namespace App\Http\Controllers\Api\Reports;

use App\Http\Controllers\Controller;
use App\Models\GeneratedReport;
use App\Services\Reports\MonthlyReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportDownloadController extends Controller
{
    use ApiResponse;

    public function __construct(
        private MonthlyReportService $reportService
    ) {}

    /**
     * List all generated reports.
     */
    public function index(Request $request): JsonResponse
    {
        $reports = GeneratedReport::query()
            ->when($request->filled('type'), fn ($q) => $q->where('report_type', $request->type))
            ->orderByDesc('generated_at')
            ->paginate((int) $request->get('per_page', 20));

        return $this->paginatedResponse($reports, 'Reports retrieved successfully.');
    }

    /**
     * Generate a new monthly report on-demand.
     */
    public function generate(): JsonResponse
    {
        $report = $this->reportService->generateMonthlyReport(auth()->id());

        return $this->createdResponse($report, 'Monthly report generated successfully.');
    }

    /**
     * Download a generated report PDF.
     */
    public function download(int $id): StreamedResponse
    {
        $report = GeneratedReport::findOrFail($id);

        if (!Storage::exists($report->file_path)) {
            abort(404, 'Report file not found.');
        }

        return Storage::download(
            $report->file_path,
            $report->title . '.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    /**
     * Delete a generated report.
     */
    public function destroy(int $id): JsonResponse
    {
        $report = GeneratedReport::findOrFail($id);

        if (Storage::exists($report->file_path)) {
            Storage::delete($report->file_path);
        }

        $report->delete();

        return $this->noContentResponse('Report deleted successfully.');
    }
}
