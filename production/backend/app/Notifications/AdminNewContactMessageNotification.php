<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminNewContactMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

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

        return (new MailMessage)
            ->subject("New Contact Message - {$siteName}")
            ->greeting("New Contact Message Received!")
            ->line("A new message has been submitted through the contact form.")
            ->line("From: **{$this->message->name}**")
            ->line("Email: {$this->message->email}")
            ->line("Subject: {$this->message->subject}")
            ->line("Message:")
            ->line($this->message->message)
            ->action('View Message', $adminUrl)
            ->line("Best regards,\n{$siteName} System");
    }
}
