<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'contract_no' => $this->contract_no,
            'type' => $this->type,
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'salary' => $this->salary ? (float) $this->salary : null,
            'status' => $this->status,
            'signed_on' => $this->signed_on?->toDateString(),
            'notes' => $this->notes,
            'created_by_user_id' => $this->created_by_user_id,
            'employee' => new \App\Http\Resources\EmployeeResource($this->whenLoaded('employee')),
            'created_by' => new \App\Http\Resources\UserResource($this->whenLoaded('createdBy')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
