<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyTwoFactorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['nullable', 'string', 'required_without:recovery_code'],
            'recovery_code' => ['nullable', 'string', 'required_without:code'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required_without' => 'A two-factor code or recovery code is required.',
            'recovery_code.required_without' => 'A two-factor code or recovery code is required.',
        ];
    }
}
