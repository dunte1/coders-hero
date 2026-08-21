<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoboticsMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'equipment_id' => ['required', 'integer', 'exists:robotics_equipment,id'],
            'type' => ['required', Rule::in(['repair', 'calibration', 'inspection', 'cleaning', 'replacement'])],
            'issue_description' => ['nullable', 'string'],
            'status' => ['nullable', Rule::in(['reported', 'in_progress', 'resolved'])],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'maintenance_date' => ['nullable', 'date'],
        ];
    }
}
