<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    public function __construct(
        public $user
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Welcome to Coder's Hero ERP!")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Thank you for joining Coder's Hero ERP & LMS.")
            ->line("Your account has been created successfully. You can now explore courses, manage tasks, and collaborate with your team.")
            ->action('Go to Dashboard', env('FRONTEND_URL', 'http://localhost:5173'))
            ->line('If you have any questions, feel free to reach out to our support team.')
            ->line("Best regards,\nThe Coder's Hero Team");
    }
}
