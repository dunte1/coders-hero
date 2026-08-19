<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assignee_type' => ['required', Rule::in(['student', 'employee', 'robotics_team'])],
            'assignee_id' => ['required', 'integer'],
            'expected_return_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
        ];
    }
}
