<?php

namespace App\Jobs;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class GenerateCertificateJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public Enrollment $enrollment
    ) {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $existing = Certificate::where('enrollment_id', $this->enrollment->id)->first();

        if ($existing) {
            return;
        }

        $certificateNumber = 'CH-' . strtoupper(Str::random(4)) . '-' . date('Y') . '-' . str_pad($this->enrollment->id, 5, '0', STR_PAD_LEFT);
        $verificationCode = Str::random(32);

        $certificate = Certificate::create([
            'user_id' => $this->enrollment->user_id,
            'course_id' => $this->enrollment->course_id,
            'enrollment_id' => $this->enrollment->id,
            'certificate_number' => $certificateNumber,
            'issued_at' => now(),
            'verification_code' => $verificationCode,
        ]);

        \App\Jobs\SendNotificationJob::dispatch(
            $this->enrollment->user_id,
            'Certificate Generated!',
            'Your course completion certificate has been generated.',
            'certificate_generated'
        );

        activity()
            ->performedOn($certificate)
            ->event('certificate_generated')
            ->withProperties([
                'user_id' => $this->enrollment->user_id,
                'course_id' => $this->enrollment->course_id,
                'certificate_number' => $certificateNumber,
            ])
            ->log('Certificate generated for course completion');
    }

    public function failed(\Throwable $exception): void
    {
        \Illuminate\Support\Facades\Log::error("Failed to generate certificate for enrollment {$this->enrollment->id}: {$exception->getMessage()}");
    }
}
