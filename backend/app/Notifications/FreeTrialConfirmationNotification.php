<?php

namespace App\Notifications;

use App\Models\FreeTrialBooking;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class FreeTrialConfirmationNotification extends BrandedNotification
{
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

        return $this->brandedMail(
            "Free Trial Booking Confirmed - {$siteName}",
            "Hello {$this->booking->parent_name}!",
            [
                "Thank you for booking a free trial class at {$siteName}!",
                "Child's Name: **{$this->booking->child_name}**",
                "Grade: {$this->booking->grade}",
                "Our team will contact you shortly to schedule the trial class.",
                "If you have any questions, please don't hesitate to reach out.",
            ]
        );
    }
}
