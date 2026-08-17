<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'asset_category_id' => ['nullable', 'integer', 'exists:asset_categories,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(['available', 'assigned', 'in_maintenance', 'disposed', 'lost'])],
            'condition' => ['sometimes', Rule::in(['new', 'good', 'fair', 'poor'])],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'supplier' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'robotics_equipment_id' => ['nullable', 'integer', 'exists:robotics_equipment,id'],
        ];
    }
}
