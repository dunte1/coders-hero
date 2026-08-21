<?php

namespace App\Http\Requests\Hr;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'contract_no' => ['nullable', 'string', 'max:50', 'unique:employee_contracts,contract_no'],
            'type' => ['required', 'string', 'in:permanent,fixed_term,contract,intern'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'string', 'in:active,expired,terminated,superseded'],
            'signed_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
