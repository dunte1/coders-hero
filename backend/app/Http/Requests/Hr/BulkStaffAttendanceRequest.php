<?php

namespace App\Http\Requests\Hr;

use Illuminate\Foundation\Http\FormRequest;

class BulkStaffAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attendance_date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.employee_id' => ['required', 'integer', 'distinct', 'exists:employees,id'],
            'records.*.status' => ['required', 'string', 'in:present,absent,late,half_day,leave'],
            'records.*.check_in' => ['nullable', 'date_format:H:i'],
            'records.*.check_out' => ['nullable', 'date_format:H:i'],
            'records.*.note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
