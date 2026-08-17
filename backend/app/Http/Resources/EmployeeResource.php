<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'employee_id' => $this->employee_id,
            'department_id' => $this->department_id,
            'position_id' => $this->position_id,
            'hire_date' => $this->hire_date->toDateString(),
            'employment_type' => $this->employment_type,
            'salary' => $this->salary ? (float) $this->salary : null,
            'status' => $this->status,
            'tenure' => $this->tenure,
            'user' => new UserResource($this->whenLoaded('user')),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'position' => new PositionResource($this->whenLoaded('position')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
