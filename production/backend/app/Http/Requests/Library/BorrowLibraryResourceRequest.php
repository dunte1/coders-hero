<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;

class BorrowLibraryResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'due_at' => ['nullable', 'date', 'after_or_equal:today'],
            'note' => ['nullable', 'string'],
        ];
    }
}
