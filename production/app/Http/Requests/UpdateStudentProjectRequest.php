<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'problem_statement' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'technologies' => ['nullable', 'array'],
            'repo_url' => ['nullable', 'url', 'max:500'],
            'demo_url' => ['nullable', 'url', 'max:500'],
            'status' => ['sometimes', 'in:planning,in_progress,completed'],
        ];
    }
}
