<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:100'],
            'allocated_amount' => ['required', 'numeric', 'min:0.01'],
            'fiscal_year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'period' => ['nullable', 'string', 'max:60'],
        ];
    }
}
