<?php

namespace App\Http\Requests\Competitions;

use Illuminate\Foundation\Http\FormRequest;

class SubmitCompetitionTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'submission_url' => ['required', 'string', 'url', 'max:2048'],
            'project_title' => ['nullable', 'string', 'max:255'],
        ];
    }
}
