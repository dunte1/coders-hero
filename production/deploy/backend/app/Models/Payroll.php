<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payroll extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'payroll_no',
        'month',
        'status',
        'gross_total',
        'deductions_total',
        'net_total',
        'processed_by_user_id',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'gross_total' => 'decimal:2',
            'deductions_total' => 'decimal:2',
            'net_total' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    public function scopeByMonth($query, string $month)
    {
        return $query->where('month', $month);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
