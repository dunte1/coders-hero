<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffAttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'attendance_date' => $this->attendance_date->toDateString(),
            'status' => $this->status,
            'check_in' => $this->check_in,
            'check_out' => $this->check_out,
            'note' => $this->note,
            'recorded_by_user_id' => $this->recorded_by_user_id,
            'employee' => new \App\Http\Resources\EmployeeResource($this->whenLoaded('employee')),
            'recorded_by' => new \App\Http\Resources\UserResource($this->whenLoaded('recordedBy')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
