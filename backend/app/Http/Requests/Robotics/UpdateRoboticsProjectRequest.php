<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoboticsProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['sometimes', 'required', Rule::in(['class', 'competition', 'personal'])],
            'status' => ['sometimes', 'required', Rule::in(['planning', 'in_progress', 'completed', 'archived'])],
            'start_date' => ['nullable', 'date'],
            'deadline' => ['nullable', 'date', 'after_or_equal:start_date'],
            'goals' => ['nullable', 'array'],
        ];
    }
}
