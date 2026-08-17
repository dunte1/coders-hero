<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddRoboticsTeamMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'role' => ['nullable', Rule::in(['leader', 'member'])],
        ];
    }
}
