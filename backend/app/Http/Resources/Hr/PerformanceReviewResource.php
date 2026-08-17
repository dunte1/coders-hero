<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'reviewer_user_id' => $this->reviewer_user_id,
            'review_period' => $this->review_period,
            'review_date' => $this->review_date->toDateString(),
            'rating' => $this->rating,
            'goals' => $this->goals,
            'achievements' => $this->achievements,
            'areas_to_improve' => $this->areas_to_improve,
            'feedback' => $this->feedback,
            'status' => $this->status,
            'employee' => new \App\Http\Resources\EmployeeResource($this->whenLoaded('employee')),
            'reviewer' => new \App\Http\Resources\UserResource($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
