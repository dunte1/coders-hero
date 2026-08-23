<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_school_id' => ['sometimes', 'integer', 'exists:partner_schools,id'],
            'contract_number' => ['sometimes', 'string', 'max:255', 'unique:school_contracts,contract_number,' . $this->route('id')],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'value' => ['nullable', 'numeric', 'min:0'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'renewal_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:draft,active,expired,terminated'],
        ];
    }
}
