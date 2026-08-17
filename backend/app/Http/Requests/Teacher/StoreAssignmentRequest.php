<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
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
            'instructions' => ['nullable', 'string'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'type' => ['required', 'string', 'in:homework,classwork,project,essay,exercise'],
            'max_score' => ['nullable', 'numeric', 'min:0'],
            'due_at' => ['nullable', 'date'],
            'status' => ['required', 'string', 'in:draft,published,closed'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'file', 'max:10240'],
            'settings' => ['nullable', 'array'],
        ];
    }
}
