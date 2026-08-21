<?php

namespace App\Jobs;

use App\Models\ActivityLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExportReportJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;

    public function __construct(
        public string $reportType,
        public array $filters = [],
        public string $userId
    ) {
        $this->onQueue('reports');
    }

    public function handle(): void
    {
        $data = match ($this->reportType) {
            'users' => $this->exportUsers(),
            'courses' => $this->exportCourses(),
            'enrollments' => $this->exportEnrollments(),
            'activity' => $this->exportActivity(),
            default => throw new \InvalidArgumentException("Unknown report type: {$this->reportType}"),
        };

        $filename = "{$this->reportType}_report_" . now()->format('Y-m-d_His') . '.json';
        $path = storage_path("app/reports/{$filename}");

        if (!is_dir(storage_path('app/reports'))) {
            mkdir(storage_path('app/reports'), 0755, true);
        }

        file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));

        \App\Jobs\SendNotificationJob::dispatch(
            $this->userId,
            'Report Ready',
            "Your {$this->reportType} report has been generated and is ready for download.",
            'report_ready'
        );

        activity()
            ->event('report_exported')
            ->withProperties([
                'report_type' => $this->reportType,
                'filename' => $filename,
                'user_id' => $this->userId,
            ])
            ->log("Report exported: {$this->reportType}");
    }

    private function exportUsers(): array
    {
        $query = \App\Models\User::with('roles');

        if (!empty($this->filters['role'])) {
            $query->role($this->filters['role']);
        }

        if (!empty($this->filters['status'])) {
            $query->where('is_active', $this->filters['status'] === 'active');
        }

        return $query->get()->toArray();
    }

    private function exportCourses(): array
    {
        $query = \App\Models\Course::with(['category', 'instructor', 'enrollments']);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['category_id'])) {
            $query->where('category_id', $this->filters['category_id']);
        }

        return $query->get()->toArray();
    }

    private function exportEnrollments(): array
    {
        $query = \App\Models\Enrollment::with(['user', 'course']);

        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['user_id'])) {
            $query->where('user_id', $this->filters['user_id']);
        }

        if (!empty($this->filters['course_id'])) {
            $query->where('course_id', $this->filters['course_id']);
        }

        return $query->get()->toArray();
    }

    private function exportActivity(): array
    {
        $query = ActivityLog::with('subject');

        if (!empty($this->filters['start_date'])) {
            $query->where('created_at', '>=', $this->filters['start_date']);
        }

        if (!empty($this->filters['end_date'])) {
            $query->where('created_at', '<=', $this->filters['end_date']);
        }

        if (!empty($this->filters['event'])) {
            $query->where('event', $this->filters['event']);
        }

        return $query->latest()->limit(10000)->get()->toArray();
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("Failed to export report {$this->reportType}: {$exception->getMessage()}");
    }
}
