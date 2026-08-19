<?php

namespace App\Http\Requests\Competitions;

use App\Models\Competition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompetitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Competition::TYPES)],
            'description' => ['nullable', 'string'],
            'rules' => ['nullable', 'array'],
            'venue' => ['nullable', 'string', 'max:255'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'registration_deadline' => ['nullable', 'date'],
            'min_team_size' => ['nullable', 'integer', 'min:1', 'max:10'],
            'max_team_size' => ['nullable', 'integer', 'min:1', 'max:20'],
            'status' => ['nullable', Rule::in(Competition::STATUSES)],
        ];
    }
}
