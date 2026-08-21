<?php

namespace App\Http\Requests\Hr;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'reviewer_user_id' => ['nullable', 'string', 'exists:users,id'],
            'review_period' => ['nullable', 'string', 'max:50'],
            'review_date' => ['required', 'date'],
            'rating' => ['nullable', 'integer', 'between:1,5'],
            'goals' => ['nullable', 'string'],
            'achievements' => ['nullable', 'string'],
            'areas_to_improve' => ['nullable', 'string'],
            'feedback' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', 'in:draft,submitted,acknowledged'],
        ];
    }
}
