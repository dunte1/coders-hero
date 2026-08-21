<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'asset_code',
        'name',
        'asset_category_id',
        'location_id',
        'serial_number',
        'qr_code',
        'status',
        'condition',
        'purchase_date',
        'purchase_cost',
        'supplier',
        'notes',
        'robotics_equipment_id',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'purchase_cost' => 'decimal:2',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function activeAssignment(): ?AssetAssignment
    {
        return $this->assignments()->whereNull('returned_at')->latest('assigned_at')->first();
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(AssetMaintenanceRecord::class);
    }

    public function openMaintenanceRecords(): HasMany
    {
        return $this->hasMany(AssetMaintenanceRecord::class)->where('status', '!=', 'resolved');
    }

    public function roboticsEquipment(): BelongsTo
    {
        return $this->belongsTo(RoboticsEquipment::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function scopeByStatus($query, ?string $status)
    {
        if ($status && $status !== 'all') {
            return $query->where('status', $status);
        }

        return $query;
    }

    public function scopeByCategory($query, ?int $categoryId)
    {
        if ($categoryId) {
            return $query->where('asset_category_id', $categoryId);
        }

        return $query;
    }

    public function scopeByLocation($query, ?int $locationId)
    {
        if ($locationId) {
            return $query->where('location_id', $locationId);
        }

        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('asset_code', 'like', "%{$term}%")
                    ->orWhere('serial_number', 'like', "%{$term}%")
                    ->orWhere('qr_code', 'like', "%{$term}%");
            });
        }

        return $query;
    }
}
