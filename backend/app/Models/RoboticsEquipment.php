<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoboticsEquipment extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'sku',
        'manufacturer',
        'description',
        'quantity_total',
        'quantity_available',
        'location',
        'condition',
        'status',
        'qr_code',
    ];

    protected function casts(): array
    {
        return [
            'quantity_total' => 'integer',
            'quantity_available' => 'integer',
        ];
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(RoboticsEquipmentAssignment::class, 'equipment_id');
    }

    public function activeAssignments(): HasMany
    {
        return $this->hasMany(RoboticsEquipmentAssignment::class, 'equipment_id')->whereNull('returned_at');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(RoboticsEquipmentReservation::class, 'equipment_id');
    }

    public function pendingReservations(): HasMany
    {
        return $this->hasMany(RoboticsEquipmentReservation::class, 'equipment_id')->where('status', 'pending');
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(RoboticsMaintenanceRecord::class, 'equipment_id');
    }

    public function openMaintenanceRecords(): HasMany
    {
        return $this->hasMany(RoboticsMaintenanceRecord::class, 'equipment_id')->where('status', '!=', 'resolved');
    }

    public function getAssignedQuantityAttribute(): int
    {
        return (int) $this->activeAssignments()->sum('quantity');
    }

    public function getAvailableQuantityAttribute(): int
    {
        return $this->quantity_available;
    }

    public function isRetired(): bool
    {
        return $this->status === 'retired';
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, ?string $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('type', $type);
        }

        return $query;
    }

    public function scopeByStatus($query, ?string $status)
    {
        if ($status && $status !== 'all') {
            return $query->where('status', $status);
        }

        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%")
                    ->orWhere('manufacturer', 'like', "%{$term}%")
                    ->orWhere('qr_code', 'like', "%{$term}%");
            });
        }

        return $query;
    }
}
