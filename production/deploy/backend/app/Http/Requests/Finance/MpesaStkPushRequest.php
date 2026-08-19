<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MpesaStkPushRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_id' => ['required_without:fee_id', 'nullable', 'exists:invoices,id'],
            'fee_id' => ['required_without:invoice_id', 'nullable', 'exists:fees,id'],
            'phone' => ['required', 'regex:/^(254|0)\d{9}$/'],
            'account_reference' => ['nullable', 'string', 'max:12'],
        ];
    }
}
