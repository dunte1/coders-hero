<?php

namespace App\Notifications;

use App\Models\Admission;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdmissionStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Admission $admission,
        public string $newStatus,
        public ?string $reason = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();
        $applicantName = $this->admission->first_name . ' ' . $this->admission->last_name;
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        $message = (new MailMessage)
            ->subject("Application Status Update - {$siteName}")
            ->greeting("Hello {$applicantName}!")
            ->line("We have an update regarding your application to {$siteName}.")
            ->line("Application Number: **{$this->admission->application_number}**");

        return match ($this->newStatus) {
            'admitted' => $message
                ->line("Congratulations! Your application has been **approved**.")
                ->line("You have been admitted as a student at {$siteName}.")
                ->line("We will contact you shortly with next steps regarding your enrollment.")
                ->action('View Your Dashboard', $frontendUrl)
                ->line("Best regards,\nThe {$siteName} Team"),
            'rejected' => $message
                ->line("We regret to inform you that your application has not been approved at this time.")
                ->line($this->reason ? "Reason: {$this->reason}" : "After careful review, we are unable to offer admission at this time.")
                ->line("You may reapply in the future. If you have questions, please contact us.")
                ->line("Best regards,\nThe {$siteName} Team"),
            default => $message
                ->line("Your application status has been updated to: **{$this->newStatus}**.")
                ->line("Best regards,\nThe {$siteName} Team"),
        };
    }
}
