<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'source' => ['sometimes', 'in:contact_form,free_trial,referral,social,other'],
            'status' => ['sometimes', 'in:new,contacted,qualified,won,lost'],
            'owner_id' => ['nullable', 'uuid', 'exists:users,id'],
            'notes' => ['nullable', 'string'],
            'next_follow_up_at' => ['nullable', 'date'],
        ];
    }
}
