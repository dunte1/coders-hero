<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['sometimes', 'string', 'max:100'],
            'allocated_amount' => ['sometimes', 'numeric', 'min:0.01'],
            'fiscal_year' => ['sometimes', 'integer', 'min:2000', 'max:2100'],
            'period' => ['nullable', 'string', 'max:60'],
        ];
    }
}
