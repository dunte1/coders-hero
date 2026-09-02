<?php

namespace App\Notifications;

use App\Models\FreeTrialBooking;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class AdminNewFreeTrialNotification extends BrandedNotification
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
        $adminUrl = config('app.frontend_url', 'http://localhost:5173') . '/admin/free-trials';

        return $this->brandedMail(
            "New Free Trial Booking - {$siteName}",
            "New Free Trial Booking!",
            [
                "A new free trial class has been booked.",
                "Parent: **{$this->booking->parent_name}**",
                "Child: {$this->booking->child_name}",
                "Grade: {$this->booking->grade}",
                "Phone: {$this->booking->phone}",
                "Email: {$this->booking->email}",
            ],
            $adminUrl,
            'View Booking'
        );
    }
}
