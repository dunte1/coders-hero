<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationPreferencesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categories = array_keys(config('notifications.categories'));

        return [
            'preferences' => ['required', 'array'],
            'preferences.*' => ['array'],
            'preferences.*.email' => ['sometimes', 'boolean'],
            'preferences.*.sms' => ['sometimes', 'boolean'],
            'preferences.*.push' => ['sometimes', 'boolean'],
            'preferences.*.in_app' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'preferences.required' => 'At least one category preference must be provided.',
        ];
    }
}
