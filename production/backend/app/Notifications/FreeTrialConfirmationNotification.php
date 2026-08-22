<?php

namespace App\Notifications;

use App\Models\FreeTrialBooking;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FreeTrialConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public FreeTrialBooking $booking
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();

        return (new MailMessage)
            ->subject("Free Trial Booking Confirmed - {$siteName}")
            ->greeting("Hello {$this->booking->parent_name}!")
            ->line("Thank you for booking a free trial class at {$siteName}!")
            ->line("Child's Name: **{$this->booking->child_name}**")
            ->line("Grade: {$this->booking->grade}")
            ->line("Our team will contact you shortly to schedule the trial class.")
            ->line("If you have any questions, please don't hesitate to reach out.")
            ->line("Best regards,\nThe {$siteName} Team");
    }
}
