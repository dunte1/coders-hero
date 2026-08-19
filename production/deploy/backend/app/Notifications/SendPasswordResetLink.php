<?php

namespace App\Notifications;

use App\Models\SiteSetting;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class SendPasswordResetLink extends ResetPassword
{
    public function toUrl($notifiable): string
    {
        return config('app.frontend_url')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());
    }

    public function toMail($notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();

        return (new MailMessage)
            ->subject("Reset Password Notification - {$siteName}")
            ->greeting("Hello {$notifiable->name}!")
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $this->toUrl($notifiable))
            ->line('This password reset link will expire in ' . config('auth.passwords.users.expire') . ' minutes.')
            ->line("If you did not request a password reset, no further action is required.\n\nBest regards,\nThe {$siteName} Team");
    }
}
