<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'payroll_id',
        'employee_id',
        'gross_amount',
        'deductions_amount',
        'net_amount',
        'deductions_breakdown',
        'allowances_breakdown',
        'status',
        'payment_method',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount' => 'decimal:2',
            'deductions_amount' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'deductions_breakdown' => 'array',
            'allowances_breakdown' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
