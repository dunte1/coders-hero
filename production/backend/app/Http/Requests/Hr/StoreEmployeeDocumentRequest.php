<?php

namespace App\Http\Requests\Hr;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'integer', 'exists:employees,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:contract,national_id,certificate,degree,payslip,other'],
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,png,jpg,jpeg,xls,xlsx', 'max:10240'],
        ];
    }
}
