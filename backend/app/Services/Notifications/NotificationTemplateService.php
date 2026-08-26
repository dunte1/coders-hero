<?php

namespace App\Services\Notifications;

use App\Models\NotificationTemplate;

class NotificationTemplateService
{
    /**
     * Render a template by replacing {{placeholder}} tokens with data values.
     */
    public function render(NotificationTemplate $template, array $data = []): array
    {
        $subject = $template->subject;
        $body = $template->body;

        foreach ($data as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $replacement = is_scalar($value) || $value === null
                ? e((string) $value)
                : (is_array($value) ? e(json_encode($value)) : e((string) $value));

            if (str_contains((string) $subject, $placeholder)) {
                $subject = str_replace($placeholder, $replacement, (string) $subject);
            }

            if (str_contains((string) $body, $placeholder)) {
                $body = str_replace($placeholder, $replacement, (string) $body);
            }
        }

        return [
            'title' => $this->makeTitle($template, $data),
            'subject' => $subject,
            'body' => $body,
        ];
    }

    /**
     * Build a short human-readable title for the in-app/push notification.
     */
    public function makeTitle(NotificationTemplate $template, array $data = []): string
    {
        $customTitle = $data['title'] ?? null;

        if (is_string($customTitle) && trim($customTitle) !== '') {
            return $customTitle;
        }

        return $template->name ?? $template->event;
    }
}
