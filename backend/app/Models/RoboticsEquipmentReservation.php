<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoboticsEquipmentReservation extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'team_id',
        'reserved_by_user_id',
        'quantity',
        'start_at',
        'end_at',
        'purpose',
        'status',
        'reviewed_by_user_id',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(RoboticsEquipment::class, 'equipment_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(RoboticsTeam::class, 'team_id');
    }

    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reserved_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
