<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categories = array_keys(config('notifications.categories'));

        return [
            'event' => ['required', 'string', 'exists:notification_templates,event'],
            'data' => ['sometimes', 'array'],
            'link' => ['nullable', 'string', 'max:1000'],
            'channels' => ['sometimes', 'array'],
            'channels.*' => ['sometimes', Rule::in(['in_app', 'email', 'sms', 'push'])],
            'recipient_type' => ['required', Rule::in(['users', 'role'])],
            'recipient_ids' => ['required_if:recipient_type,users', 'array'],
            'recipient_ids.*' => ['sometimes', 'exists:users,id'],
            'role' => ['required_if:recipient_type,role', 'string', 'exists:roles,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'event.exists' => 'The selected event template does not exist.',
            'recipient_ids.*.exists' => 'One or more recipients are invalid.',
            'role.exists' => 'The selected role does not exist.',
        ];
    }
}
