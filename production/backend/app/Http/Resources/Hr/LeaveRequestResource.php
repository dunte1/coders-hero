<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'leave_type' => $this->leave_type,
            'start_date' => $this->start_date->toDateString(),
            'end_date' => $this->end_date->toDateString(),
            'days' => $this->days,
            'reason' => $this->reason,
            'status' => $this->status,
            'requested_by_user_id' => $this->requested_by_user_id,
            'reviewed_by_user_id' => $this->reviewed_by_user_id,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'review_note' => $this->review_note,
            'employee' => new \App\Http\Resources\EmployeeResource($this->whenLoaded('employee')),
            'requested_by' => new \App\Http\Resources\UserResource($this->whenLoaded('requestedBy')),
            'reviewed_by' => new \App\Http\Resources\UserResource($this->whenLoaded('reviewedBy')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
