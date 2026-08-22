<?php

namespace App\Notifications;

use App\Models\Admission;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

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

        return (new MailMessage)
            ->subject("New Student Application - {$siteName}")
            ->greeting("New Application Received!")
            ->line("A new student application has been submitted.")
            ->line("Applicant: **{$applicantName}**")
            ->line("Application Number: **{$this->admission->application_number}**")
            ->line("Grade: {$this->admission->grade}")
            ->line("Parent/Guardian: {$this->admission->guardian_name}")
            ->line("Email: {$this->admission->email}")
            ->line("Phone: {$this->admission->phone}")
            ->action('Review Application', $adminUrl)
            ->line("Best regards,\n{$siteName} System");
    }
}
