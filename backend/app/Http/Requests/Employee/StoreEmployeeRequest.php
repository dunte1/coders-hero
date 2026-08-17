<?php

namespace App\Http\Requests\Employee;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'nullable', 'string', 'exists:users,id'],
            'name' => ['required_without:user_id', 'string', 'max:255'],
            'email' => ['required_without:user_id', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required_without:user_id', 'string', 'min:8'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'position_id' => ['required', 'integer', 'exists:positions,id'],
            'hire_date' => ['required', 'date', 'before_or_equal:today'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,intern'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'employee_id' => ['nullable', 'string', 'unique:employees,employee_id'],
        ];
    }
}
