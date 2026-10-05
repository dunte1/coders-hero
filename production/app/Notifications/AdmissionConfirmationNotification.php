<?php

namespace App\Notifications;

use App\Models\Admission;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class AdmissionConfirmationNotification extends BrandedNotification
{
    public function __construct(
        public Admission $admission
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();
        $applicantName = $this->admission->first_name . ' ' . $this->admission->last_name;

        return $this->brandedMail(
            "Application Received - {$siteName}",
            "Hello {$applicantName}!",
            [
                "Thank you for applying to {$siteName}!",
                "We have received your application and it is now under review.",
                "Application Number: **{$this->admission->application_number}**",
                "Program: {$this->admission->program_of_interest}",
                "Grade: {$this->admission->grade}",
                "Our team will review your application and get back to you within 2-3 business days.",
                "If you have any questions, please don't hesitate to contact us.",
            ]
        );
    }
}
