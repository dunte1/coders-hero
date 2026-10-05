<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class AdminNewContactMessageNotification extends BrandedNotification
{
    public function __construct(
        public ContactMessage $message
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();
        $adminUrl = config('app.frontend_url', 'http://localhost:5173') . '/admin/contact-messages';

        return $this->brandedMail(
            "New Contact Message - {$siteName}",
            "New Contact Message Received!",
            [
                "A new message has been submitted through the contact form.",
                "From: **{$this->message->name}**",
                "Email: {$this->message->email}",
                "Subject: {$this->message->subject}",
                "Message: {$this->message->message}",
            ],
            $adminUrl,
            'View Message'
        );
    }
}
