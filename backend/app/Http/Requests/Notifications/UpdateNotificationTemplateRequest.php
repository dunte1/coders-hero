<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNotificationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categories = array_keys(config('notifications.categories'));
        $templateId = $this->route('notification_template');

        return [
            'event' => ['sometimes', 'string', 'max:191', Rule::unique('notification_templates', 'event')->ignore($templateId)],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['sometimes', Rule::in($categories)],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'channels' => ['sometimes', 'array'],
            'channels.*' => ['sometimes', Rule::in(['in_app', 'email', 'sms', 'push'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
