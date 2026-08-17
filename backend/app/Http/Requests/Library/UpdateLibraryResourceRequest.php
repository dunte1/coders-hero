<?php

namespace App\Http\Requests\Library;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLibraryResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:library_categories,id'],
            'author_id' => ['nullable', 'integer', 'exists:library_authors,id'],
            'description' => ['nullable', 'string'],
            'resource_type' => ['sometimes', Rule::in(['ebook', 'video', 'notes', 'past_paper', 'coding_resource', 'robotics_manual'])],
            'file' => ['nullable', 'file', 'max:51200'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'language' => ['nullable', 'string', 'max:10'],
            'is_public' => ['sometimes', 'boolean'],
            'download_allowed' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
