<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:pending,in_progress,review,completed,overdue'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high,critical'],
            'due_date' => ['sometimes', 'date'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
        ];
    }
}
