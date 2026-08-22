<?php

namespace App\Console\Commands;

use App\Services\Reports\MonthlyReportService;
use Illuminate\Console\Command;

class GenerateMonthlyReports extends Command
{
    protected $signature = 'reports:monthly';
    protected $description = 'Generate the monthly report bundle for the previous month';

    public function handle(MonthlyReportService $reportService): int
    {
        $this->info('Generating monthly report...');

        try {
            $report = $reportService->generateMonthlyReport();
            $this->info("Report generated: {$report->title} ({$report->file_size_formatted})");
            $this->info("File: {$report->file_path}");
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Failed to generate report: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
