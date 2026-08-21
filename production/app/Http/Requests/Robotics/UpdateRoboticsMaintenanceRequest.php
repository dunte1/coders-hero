<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoboticsMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'required', Rule::in(['repair', 'calibration', 'inspection', 'cleaning', 'replacement'])],
            'issue_description' => ['nullable', 'string'],
            'resolution' => ['nullable', 'string'],
            'status' => ['sometimes', 'required', Rule::in(['reported', 'in_progress', 'resolved'])],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'maintenance_date' => ['nullable', 'date'],
        ];
    }
}
