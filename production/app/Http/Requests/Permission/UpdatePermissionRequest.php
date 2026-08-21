<?php

namespace App\Http\Requests\Permission;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $permissionId = $this->route('id');

        return [
            'name' => ['sometimes', 'string', 'max:100', 'unique:permissions,name,' . $permissionId],
            'display_name' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'group' => ['nullable', 'string', 'max:50'],
        ];
    }
}
