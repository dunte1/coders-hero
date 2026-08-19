<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class PageViewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'path' => ['required', 'string', 'max:500'],
            'referrer' => ['nullable', 'string', 'max:500'],
            'visitor_id' => ['nullable', 'string', 'max:64'],
            'is_mobile' => ['nullable', 'boolean'],
        ];
    }
}
