<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $locationId = $this->route('location');

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('locations', 'name')->ignore($locationId)],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('locations', 'code')->ignore($locationId)],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
