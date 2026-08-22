<?php

namespace App\Notifications;

use App\Models\Admission;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdmissionConfirmationNotification extends Notification implements ShouldQueue
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

        return (new MailMessage)
            ->subject("Application Received - {$siteName}")
            ->greeting("Hello {$applicantName}!")
            ->line("Thank you for applying to {$siteName}!")
            ->line("We have received your application and it is now under review.")
            ->line("Application Number: **{$this->admission->application_number}**")
            ->line("Program: {$this->admission->program_of_interest}")
            ->line("Grade: {$this->admission->grade}")
            ->line("Our team will review your application and get back to you within 2-3 business days.")
            ->line("If you have any questions, please don't hesitate to contact us.")
            ->line("Best regards,\nThe {$siteName} Team");
    }
}
