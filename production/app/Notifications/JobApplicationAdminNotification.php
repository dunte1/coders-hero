<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class JobApplicationAdminNotification extends BrandedNotification
{
    public function __construct(private JobApplication $application) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $job = $this->application->jobListing;
        $siteName = SiteSetting::siteName();
        $adminUrl = config('app.frontend_url', 'http://localhost:5173') . '/cms/jobs/applications';

        return $this->brandedMail(
            "New Job Application - " . ($job->title ?? 'Job Application'),
            "New Application Received",
            [
                "A new application has been submitted for the {$job->title} position.",
                "Applicant: {$this->application->name}",
                "Email: {$this->application->email}",
                "You can review the application in the admin dashboard.",
            ],
            $adminUrl,
            'View Application'
        );
    }
}
