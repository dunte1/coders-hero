<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'max_attempts' => ['nullable', 'integer', 'min:1'],
            'is_randomized' => ['nullable', 'boolean'],
            'questions' => ['nullable', 'array', 'min:1'],
            'questions.*.question' => ['required_with:questions', 'string'],
            'questions.*.type' => ['required_with:questions', 'string', 'in:multiple_choice,true_false,short_answer'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.options.*' => ['string'],
            'questions.*.correct_answer' => ['required_with:questions', 'string'],
            'questions.*.explanation' => ['nullable', 'string'],
            'questions.*.points' => ['nullable', 'integer', 'min:1'],
            'questions.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
