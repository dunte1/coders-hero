<?php

namespace App\Http\Requests\Lms;

use Illuminate\Foundation\Http\FormRequest;

class RunPlaygroundCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $languages = array_keys(config('services.code_runner.languages', []));

        return [
            'code' => ['required', 'string'],
            'language' => ['required', 'string', 'in:' . implode(',', $languages)],
            'stdin' => ['nullable', 'string'],
        ];
    }
}