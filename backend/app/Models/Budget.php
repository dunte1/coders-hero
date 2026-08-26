<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'category',
        'allocated_amount',
        'spent_amount',
        'fiscal_year',
        'period',
    ];

    protected function casts(): array
    {
        return [
            'allocated_amount' => 'decimal:2',
            'spent_amount' => 'decimal:2',
            'fiscal_year' => 'integer',
        ];
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0, (float) $this->allocated_amount - (float) $this->spent_amount);
    }
}
