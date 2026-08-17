<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Location extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Location $location) {
            if (empty($location->code)) {
                $location->code = Str::upper(Str::slug($location->name, '_'));
            }
        });
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where('name', 'like', "%{$term}%")
                ->orWhere('code', 'like', "%{$term}%");
        }

        return $query;
    }
}
