<?php

namespace App\Http\Requests\Robotics;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoboticsTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'mentor_user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
        ];
    }
}
