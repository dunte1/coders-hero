<?php

namespace App\Jobs;

use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncCourseProgressJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    public function __construct(
        public int $enrollmentId,
        public float $calculatedProgress
    ) {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $enrollment = Enrollment::find($this->enrollmentId);

        if (!$enrollment) {
            return;
        }

        $updateData = ['progress' => min($this->calculatedProgress, 100)];

        if ($this->calculatedProgress >= 100 && $enrollment->status !== 'completed') {
            $updateData['status'] = 'completed';
            $updateData['completed_at'] = now();
        }

        $enrollment->update($updateData);

        activity()
            ->performedOn($enrollment)
            ->event('progress_synced')
            ->withProperties([
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'progress' => $this->calculatedProgress,
            ])
            ->log('Course progress synced');
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("Failed to sync course progress for enrollment {$this->enrollmentId}: {$exception->getMessage()}");
    }
}
