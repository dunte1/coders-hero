<?php

namespace App\Notifications;

use App\Models\Admission;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class AdminNewApplicationNotification extends BrandedNotification
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
        $adminUrl = config('app.frontend_url', 'http://localhost:5173') . '/admin/admissions';

        return $this->brandedMail(
            "New Student Application - {$siteName}",
            "New Application Received!",
            [
                "A new student application has been submitted.",
                "Applicant: **{$applicantName}**",
                "Application Number: **{$this->admission->application_number}**",
                "Grade: {$this->admission->grade}",
                "Parent/Guardian: {$this->admission->guardian_name}",
                "Email: {$this->admission->email}",
                "Phone: {$this->admission->phone}",
            ],
            $adminUrl,
            'Review Application'
        );
    }
}
