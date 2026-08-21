<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGradebookEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['sometimes', 'integer', 'exists:students,id'],
            'component' => ['sometimes', 'string', 'in:assignment,exam,quiz,participation,homework,project,final'],
            'title' => ['sometimes', 'string', 'max:255'],
            'score' => ['sometimes', 'numeric', 'min:0'],
            'max_score' => ['nullable', 'numeric', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'graded_on' => ['nullable', 'date'],
            'feedback' => ['nullable', 'string'],
        ];
    }
}
