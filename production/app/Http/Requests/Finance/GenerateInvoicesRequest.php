<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class GenerateInvoicesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fee_structure_id' => ['required', 'exists:fee_structures,id'],
            'grade_level' => ['nullable', 'string', 'max:60'],
        ];
    }
}
