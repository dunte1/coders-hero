<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class BulkGradebookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.student_id' => ['required', 'integer', 'distinct', 'exists:students,id'],
            'entries.*.component' => ['required', 'string', 'in:assignment,exam,quiz,participation,homework,project,final'],
            'entries.*.title' => ['required', 'string', 'max:255'],
            'entries.*.score' => ['required', 'numeric', 'min:0'],
            'entries.*.max_score' => ['nullable', 'numeric', 'min:0'],
            'entries.*.weight' => ['nullable', 'numeric', 'min:0'],
            'entries.*.graded_on' => ['nullable', 'date'],
            'entries.*.feedback' => ['nullable', 'string'],
        ];
    }
}
