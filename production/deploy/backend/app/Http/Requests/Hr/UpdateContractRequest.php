<?php

namespace App\Http\Requests\Hr;

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
            'type' => ['sometimes', 'string', 'in:permanent,fixed_term,contract,intern'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'string', 'in:active,expired,terminated,superseded'],
            'signed_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
