<?php

namespace App\Notifications;

use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

abstract class BrandedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected function brandedMail(string $subject, string $greeting, array $lines, ?string $actionUrl = null, ?string $actionText = null): MailMessage
    {
        $mail = new MailMessage();
        $mail->subject($subject);

        $logo = SiteSetting::siteLogo();
        if ($logo && str_starts_with($logo, '/')) {
            $logo = url($logo);
        }
        $siteName = SiteSetting::siteName();
        $siteTagline = SiteSetting::siteTagline();
        $contact = SiteSetting::siteContact();

        $headerHtml = '<div style="text-align: center; padding: 12px 0;">';
        if ($logo) {
            $headerHtml .= '<img src="' . $logo . '" alt="' . e($siteName) . '" style="max-height: 56px; max-width: 180px; display: inline-block;">';
        } else {
            $headerHtml .= '<span style="font-size: 20px; font-weight: bold; color: #0f172a;">' . e($siteName) . '</span>';
        }
        if ($siteTagline) {
            $headerHtml .= '<div style="font-size: 12px; color: #64748b; margin-top: 2px;">' . e($siteTagline) . '</div>';
        }
        $headerHtml .= '</div>';

        $mail->greeting($greeting);

        foreach ($lines as $line) {
            $mail->line($line);
        }

        if ($actionUrl && $actionText) {
            $mail->action($actionText, $actionUrl);
        }

        $footerText = $siteName;
        if ($contact['phone'] ?? null) $footerText .= ' · ' . $contact['phone'];
        if ($contact['email'] ?? null) $footerText .= ' · ' . $contact['email'];
        if ($contact['address'] ?? null) $footerText .= ' · ' . $contact['address'];

        $mail->salutation("Regards,\n{$siteName}");

        return $mail;
    }
}
