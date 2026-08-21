<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class SaveWorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'language' => ['required', 'string'],
            'files' => ['required', 'array'],
            'files.*.name' => ['required', 'string'],
            'files.*.content' => ['required', 'string'],
            'active_file' => ['nullable', 'string'],
        ];
    }
}