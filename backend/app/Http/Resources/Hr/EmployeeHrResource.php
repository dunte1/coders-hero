<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeHrResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'employee_id' => $this->employee_id,
            'department_id' => $this->department_id,
            'position_id' => $this->position_id,
            'hire_date' => $this->hire_date?->toDateString(),
            'employment_type' => $this->employment_type,
            'salary' => $this->salary ? (float) $this->salary : null,
            'status' => $this->status,
            'tenure' => $this->tenure,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'national_id' => $this->national_id,
            'address' => $this->address,
            'emergency_contact' => $this->emergency_contact,
            'emergency_phone' => $this->emergency_phone,
            'bank_name' => $this->bank_name,
            'bank_account_number' => $this->bank_account_number,
            'user' => new \App\Http\Resources\UserResource($this->whenLoaded('user')),
            'department' => new \App\Http\Resources\DepartmentResource($this->whenLoaded('department')),
            'position' => new \App\Http\Resources\PositionResource($this->whenLoaded('position')),
            'active_contract' => $this->relationLoaded('contracts')
                ? ($this->contracts->firstWhere('status', 'active')
                    ? new EmployeeContractResource($this->contracts->firstWhere('status', 'active'))
                    : null)
                : ($this->activeContract()
                    ? new EmployeeContractResource($this->activeContract())
                    : null),
            'contracts_count' => $this->whenCounted('contracts'),
            'leaves_count' => $this->whenCounted('leaveRequests'),
            'payslips_count' => $this->whenCounted('payslips'),
            'documents_count' => $this->whenCounted('documents'),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
