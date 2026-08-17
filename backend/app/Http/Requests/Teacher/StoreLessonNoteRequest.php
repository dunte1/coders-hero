<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'class_id' => ['nullable', 'integer', 'exists:classes,id'],
            'note_date' => ['nullable', 'date'],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['nullable', 'file', 'max:10240'],
        ];
    }
}
