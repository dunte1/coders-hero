<?php

namespace App\Console\Commands;

use App\Jobs\SendAdmissionConfirmationJob;
use App\Jobs\NotifyAdminsNewApplicationJob;
use App\Models\Admission;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    protected $signature = 'email:test {to? : Email address to send test to}';
    protected $description = 'Send a test email to verify SMTP configuration';

    public function handle(): int
    {
        $to = $this->argument('to') ?? config('mail.from.address');

        $this->info("Testing basic SMTP...");
        try {
            Mail::raw('This is a test email from Coders Hero to verify SMTP configuration is working correctly.', function ($message) use ($to) {
                $message->to($to)
                    ->subject('Coders Hero - Email System Test');
            });
            $this->info("Basic SMTP test: PASSED");
        } catch (\Throwable $e) {
            $this->error("Basic SMTP test: FAILED - {$e->getMessage()}");
            return Command::FAILURE;
        }

        $this->info("\nTesting admission confirmation email...");
        try {
            $admission = Admission::create([
                'application_number' => 'APP999999',
                'first_name' => 'Test',
                'last_name' => 'Applicant',
                'email' => $to,
                'phone' => '+254700000000',
                'date_of_birth' => '2010-01-01',
                'gender' => 'male',
                'grade' => 'Grade 5',
                'guardian_name' => 'Test Parent',
                'guardian_phone' => '+254700000001',
                'status' => 'new',
                'source' => 'online',
                'applied_at' => now()->toDateString(),
            ]);

            SendAdmissionConfirmationJob::dispatchSync($admission);
            $this->info("Admission confirmation email: PASSED (to: {$to})");
            $this->info("Application Number: {$admission->application_number}");

            $this->info("\nTesting admin notification email...");
            NotifyAdminsNewApplicationJob::dispatchSync($admission);
            $this->info("Admin notification email: PASSED");
        } catch (\Throwable $e) {
            $this->error("Admission flow test: FAILED - {$e->getMessage()}");
            return Command::FAILURE;
        }

        $this->info("\nAll email tests PASSED!");
        return Command::SUCCESS;
    }
}
