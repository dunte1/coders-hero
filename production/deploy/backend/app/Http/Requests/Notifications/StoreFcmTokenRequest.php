<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFcmTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:1024'],
            'device_name' => ['nullable', 'string', 'max:255'],
            'platform' => ['nullable', 'string', Rule::in(['android', 'ios', 'web', 'other'])],
        ];
    }
}
