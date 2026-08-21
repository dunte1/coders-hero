<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNotificationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categories = array_keys(config('notifications.categories'));

        return [
            'event' => ['required', 'string', 'max:191', 'unique:notification_templates,event'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['required', Rule::in($categories)],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'channels' => ['sometimes', 'array'],
            'channels.*' => ['sometimes', Rule::in(['in_app', 'email', 'sms', 'push'])],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
