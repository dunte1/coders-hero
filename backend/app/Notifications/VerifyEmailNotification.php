<?php

namespace App\Notifications;

use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $verificationUrl
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();

        return (new MailMessage)
            ->subject("Verify Your Email Address - {$siteName}")
            ->greeting("Hello {$notifiable->name}!")
            ->line('Thank you for creating an account with us.')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email Address', $this->verificationUrl)
            ->line('This verification link will expire in 60 minutes.')
            ->line("If you did not create an account, no further action is required.\n\nBest regards,\nThe {$siteName} Team");
    }
}
