<?php

namespace App\Http\Requests\Hr;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'review_period' => ['nullable', 'string', 'max:50'],
            'review_date' => ['sometimes', 'date'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'goals' => ['nullable', 'string'],
            'achievements' => ['nullable', 'string'],
            'areas_to_improve' => ['nullable', 'string'],
            'feedback' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:draft,submitted,acknowledged'],
        ];
    }
}
