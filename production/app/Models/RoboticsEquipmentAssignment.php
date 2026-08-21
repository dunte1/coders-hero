<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class RoboticsEquipmentAssignment extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'assignable_type',
        'assignable_id',
        'quantity',
        'assigned_at',
        'expected_return_at',
        'returned_at',
        'note',
        'assigned_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'assigned_at' => 'datetime',
            'expected_return_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(RoboticsEquipment::class, 'equipment_id');
    }

    public function assignable(): MorphTo
    {
        return $this->morphTo();
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by_user_id');
    }

    public function getStatusAttribute(): string
    {
        if ($this->returned_at !== null) {
            return 'returned';
        }

        if ($this->expected_return_at !== null && $this->expected_return_at->isPast()) {
            return 'overdue';
        }

        return 'assigned';
    }
}
