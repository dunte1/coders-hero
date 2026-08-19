<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayslipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payroll_id' => $this->payroll_id,
            'employee_id' => $this->employee_id,
            'gross_amount' => (float) $this->gross_amount,
            'deductions_amount' => (float) $this->deductions_amount,
            'net_amount' => (float) $this->net_amount,
            'deductions_breakdown' => $this->deductions_breakdown,
            'allowances_breakdown' => $this->allowances_breakdown,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->toISOString(),
            'employee' => new \App\Http\Resources\EmployeeResource($this->whenLoaded('employee')),
            'payroll' => new PayrollResource($this->whenLoaded('payroll')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
