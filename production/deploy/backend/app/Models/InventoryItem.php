<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'asset_category_id',
        'location_id',
        'quantity',
        'unit',
        'reorder_level',
        'unit_cost',
        'supplier',
        'notes',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'reorder_level' => 'integer',
            'unit_cost' => 'decimal:2',
            'is_active' => 'boolean',
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

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function isLowStock(): bool
    {
        return $this->reorder_level > 0 && $this->quantity <= $this->reorder_level;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'reorder_level')
            ->where('reorder_level', '>', 0);
    }

    public function scopeByCategory($query, ?int $categoryId)
    {
        if ($categoryId) {
            return $query->where('asset_category_id', $categoryId);
        }

        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('sku', 'like', "%{$term}%")
                    ->orWhere('supplier', 'like', "%{$term}%");
            });
        }

        return $query;
    }
}
