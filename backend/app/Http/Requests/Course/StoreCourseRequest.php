<?php

namespace App\Http\Requests\Course;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'level' => ['required', 'string', 'in:beginner,intermediate,advanced,expert'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'duration_hours' => ['nullable', 'numeric', 'min:0'],
            'objectives' => ['nullable', 'array'],
            'objectives.*' => ['string'],
            'prerequisites' => ['nullable', 'array'],
            'prerequisites.*' => ['string'],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'max_enrollments' => ['nullable', 'integer', 'min:1'],
            'is_featured' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
            'status' => ['nullable', 'string', 'in:draft,published'],
        ];
    }
}
