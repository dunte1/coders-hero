<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'type' => ['required', 'string', 'in:quiz,test,midterm,final'],
            'scheduled_at' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'total_marks' => ['nullable', 'numeric', 'min:0'],
            'passing_marks' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string', 'in:draft,scheduled,in_progress,completed,cancelled'],
            'settings' => ['nullable', 'array'],
            'results' => ['nullable', 'array'],
            'results.*.student_id' => ['required_with:results', 'integer', 'exists:students,id'],
            'results.*.marks_obtained' => ['nullable', 'numeric', 'min:0'],
            'results.*.remarks' => ['nullable', 'string'],
            'results.*.status' => ['nullable', 'string', 'in:absent,attempted,graded'],
        ];
    }
}
