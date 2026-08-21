<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRoboticsEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', Rule::in(['kit', 'arduino_board', 'lego_kit', 'sensor', 'microcontroller', 'component'])],
            'sku' => ['nullable', 'string', 'max:255'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'quantity_total' => ['sometimes', 'required', 'integer', 'min:1'],
            'quantity_available' => ['sometimes', 'required', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'condition' => ['nullable', Rule::in(['new', 'good', 'fair', 'poor'])],
            'status' => ['nullable', Rule::in(['active', 'retired'])],
        ];
    }
}
