<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'position_id' => ['sometimes', 'integer', 'exists:positions,id'],
            'status' => ['sometimes', 'string', 'in:active,on_leave,terminated,resigned'],
            'employment_type' => ['sometimes', 'string', 'in:full_time,part_time,contract,intern'],
            'salary' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
