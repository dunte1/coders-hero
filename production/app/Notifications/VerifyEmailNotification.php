<?php

namespace App\Notifications;

use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends BrandedNotification
{
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

        return $this->brandedMail(
            "Verify Your Email Address - {$siteName}",
            "Hello {$notifiable->name}!",
            [
                'Thank you for creating an account with us.',
                'Please click the button below to verify your email address.',
                'This verification link will expire in 60 minutes.',
                'If you did not create an account, no further action is required.',
            ],
            $this->verificationUrl,
            'Verify Email Address'
        );
    }
}
