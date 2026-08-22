<?php

namespace App\Notifications;

use App\Models\FreeTrialBooking;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewFreeTrialNotification extends Notification implements ShouldQueue
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
        $adminUrl = config('app.frontend_url', 'http://localhost:5173') . '/admin/free-trials';

        return (new MailMessage)
            ->subject("New Free Trial Booking - {$siteName}")
            ->greeting("New Free Trial Booking!")
            ->line("A new free trial class has been booked.")
            ->line("Parent: **{$this->booking->parent_name}**")
            ->line("Child: {$this->booking->child_name}")
            ->line("Grade: {$this->booking->grade}")
            ->line("Phone: {$this->booking->phone}")
            ->line("Email: {$this->booking->email}")
            ->action('View Booking', $adminUrl)
            ->line("Best regards,\n{$siteName} System");
    }
}
