<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;

class ResolveRoboticsMaintenanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resolution' => ['nullable', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
