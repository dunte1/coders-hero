<?php

namespace App\Notifications;

use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class WelcomeNotification extends BrandedNotification
{
    public function __construct(
        public $user
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();

        return $this->brandedMail(
            "Welcome to {$siteName}!",
            "Hello {$notifiable->name}!",
            [
                "Thank you for joining {$siteName}.",
                "Your account has been created successfully. You can now explore courses, manage tasks, and collaborate with your team.",
                'If you have any questions, feel free to reach out to our support team.',
            ],
            env('FRONTEND_URL', 'http://localhost:5173'),
            'Go to Dashboard'
        );
    }
}
