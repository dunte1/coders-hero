<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class JobApplicationAcceptedNotification extends BrandedNotification
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

        return $this->brandedMail(
            "Congratulations! Application Accepted - " . ($job->title ?? 'Job Application'),
            "Dear {$this->application->name},",
            [
                "Congratulations! Your application for the {$job->title} position at {$siteName} has been accepted.",
                "We were impressed with your qualifications and would like to move forward with you.",
                "Our HR team will contact you shortly with the next steps.",
                "If you have any questions, please don't hesitate to reach out.",
            ]
        );
    }
}
