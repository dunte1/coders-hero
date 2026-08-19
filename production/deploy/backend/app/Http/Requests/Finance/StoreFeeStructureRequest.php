<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'fee_type' => ['required', 'in:tuition,lunch,transport,exam,uniform,activity,other'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'term' => ['nullable', 'string', 'max:60'],
            'grade_level' => ['nullable', 'string', 'max:60'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
