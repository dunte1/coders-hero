<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRoboticsEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assignable_type' => ['required', Rule::in(['student', 'team'])],
            'assignable_id' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
            'assigned_at' => ['nullable', 'date'],
            'expected_return_at' => ['nullable', 'date', 'after_or_equal:assigned_at'],
            'note' => ['nullable', 'string'],
        ];
    }
}
