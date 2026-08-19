<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payroll_no' => $this->payroll_no,
            'month' => $this->month,
            'status' => $this->status,
            'gross_total' => (float) $this->gross_total,
            'deductions_total' => (float) $this->deductions_total,
            'net_total' => (float) $this->net_total,
            'processed_by_user_id' => $this->processed_by_user_id,
            'processed_at' => $this->processed_at?->toISOString(),
            'employees_count' => $this->whenCounted('payslips'),
            'payslips' => PayslipResource::collection($this->whenLoaded('payslips')),
            'processed_by' => new \App\Http\Resources\UserResource($this->whenLoaded('processedBy')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
