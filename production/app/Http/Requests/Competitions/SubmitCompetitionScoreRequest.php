<?php

namespace App\Http\Requests\Competitions;

use Illuminate\Foundation\Http\FormRequest;

class SubmitCompetitionScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'team_id' => ['required', 'integer'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.criterion_id' => ['required', 'integer', 'distinct'],
            'scores.*.score' => ['required', 'integer', 'min:0'],
            'scores.*.remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
