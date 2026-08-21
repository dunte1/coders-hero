<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;

class SubmitRoboticsProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'files' => ['nullable', 'array'],
            'repo_url' => ['nullable', 'string', 'max:500'],
            'demo_url' => ['nullable', 'string', 'max:500'],
        ];
    }
}
