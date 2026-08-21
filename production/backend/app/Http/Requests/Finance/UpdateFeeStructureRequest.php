<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'fee_type' => ['sometimes', 'in:tuition,lunch,transport,exam,uniform,activity,other'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'term' => ['nullable', 'string', 'max:60'],
            'grade_level' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
