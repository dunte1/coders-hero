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
        return [
            'code' => ['required', 'string'],
            'language' => ['required', 'in:python,javascript'],
            'stdin' => ['nullable', 'string'],
        ];
    }
}