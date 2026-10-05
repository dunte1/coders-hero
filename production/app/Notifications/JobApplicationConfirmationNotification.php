<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class JobApplicationConfirmationNotification extends BrandedNotification
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
            "Application Received - " . ($job->title ?? 'Job Application'),
            "Dear {$this->application->name},",
            [
                "Thank you for applying for the {$job->title} position at {$siteName}.",
                "We have received your application and our team will review it shortly.",
                "You will be notified once your application status changes.",
                "If you have any questions, please don't hesitate to contact us.",
            ]
        );
    }
}
