<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class GradeExamResultsRequest extends FormRequest
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
            'entries.*.marks_obtained' => ['nullable', 'numeric', 'min:0'],
            'entries.*.remarks' => ['nullable', 'string'],
            'entries.*.status' => ['nullable', 'string', 'in:absent,attempted,graded'],
        ];
    }
}
