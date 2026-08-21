<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
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
            'assigned_to' => ['required', 'string', 'exists:users,id'],
            'priority' => ['required', 'string', 'in:low,medium,high,critical'],
            'due_date' => ['required', 'date', 'after_or_equal:today'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string'],
        ];
    }
}
