<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_school_id' => ['required', 'integer', 'exists:partner_schools,id'],
            'contract_number' => ['required', 'string', 'max:255', Rule::unique('school_contracts', 'contract_number')],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'renewal_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:draft,active,expired,terminated'],
        ];
    }
}
