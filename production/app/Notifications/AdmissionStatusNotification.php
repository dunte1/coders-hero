<?php

namespace App\Notifications;

use App\Models\Admission;
use App\Models\SiteSetting;
use Illuminate\Notifications\Messages\MailMessage;

class AdmissionStatusNotification extends BrandedNotification
{
    public function __construct(
        public Admission $admission,
        public string $newStatus,
        public ?string $reason = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $siteName = SiteSetting::siteName();
        $applicantName = $this->admission->first_name . ' ' . $this->admission->last_name;
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        $lines = [
            "We have an update regarding your application to {$siteName}.",
            "Application Number: **{$this->admission->application_number}**",
        ];

        match ($this->newStatus) {
            'admitted' => array_push($lines,
                "Congratulations! Your application has been **approved**.",
                "You have been admitted as a student at {$siteName}.",
                "We will contact you shortly with next steps regarding your enrollment."
            ),
            'rejected' => array_push($lines,
                "We regret to inform you that your application has not been approved at this time.",
                $this->reason ? "Reason: {$this->reason}" : "After careful review, we are unable to offer admission at this time.",
                "You may reapply in the future. If you have questions, please contact us."
            ),
            default => array_push($lines,
                "Your application status has been updated to: **{$this->newStatus}**."
            ),
        };

        return $this->brandedMail(
            "Application Status Update - {$siteName}",
            "Hello {$applicantName}!",
            $lines,
            $this->newStatus === 'admitted' ? $frontendUrl : null,
            $this->newStatus === 'admitted' ? 'View Your Dashboard' : null
        );
    }
}
