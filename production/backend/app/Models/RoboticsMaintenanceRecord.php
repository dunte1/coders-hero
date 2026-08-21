<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoboticsMaintenanceRecord extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'recorded_by_user_id',
        'type',
        'issue_description',
        'resolution',
        'status',
        'cost',
        'maintenance_date',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:2',
            'maintenance_date' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(RoboticsEquipment::class, 'equipment_id');
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }
}
