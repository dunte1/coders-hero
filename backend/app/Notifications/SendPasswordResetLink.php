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
        $url = $this->toUrl($notifiable);

        $mail = new MailMessage();
        $mail->subject("Reset Password Notification - {$siteName}");
        $mail->greeting("Hello {$notifiable->name}!");
        $mail->line('You are receiving this email because we received a password reset request for your account.');
        $mail->action('Reset Password', $url);
        $mail->line('This password reset link will expire in ' . config('auth.passwords.users.expire') . ' minutes.');
        $mail->line('If you did not request a password reset, no further action is required.');
        $mail->salutation("Regards,\n{$siteName}");

        return $mail;
    }
}
