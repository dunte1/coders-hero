<?php

namespace App\Mail;

use App\Models\SiteSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public string $subjectLine,
        public string $body,
        public ?string $link = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        $logo = SiteSetting::siteLogo();
        if ($logo && str_starts_with($logo, '/')) {
            $logo = url($logo);
        }

        return new Content(
            markdown: 'emails.notification',
            with: [
                'subjectLine' => $this->subjectLine,
                'body' => $this->body,
                'link' => $this->link,
                'siteName' => SiteSetting::siteName(),
                'siteLogo' => $logo,
                'siteTagline' => SiteSetting::siteTagline(),
                'contact' => SiteSetting::siteContact(),
            ],
        );
    }
}
