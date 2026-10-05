<?php

namespace App\Http\Requests\Certificate;

use Illuminate\Foundation\Http\FormRequest;

class IssueCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id' => ['nullable', 'integer', 'exists:certificate_templates,id'],
            'badge_name' => ['nullable', 'string', 'max:255'],
            'badge_color' => ['nullable', 'string', 'max:7'],
        ];
    }
}
