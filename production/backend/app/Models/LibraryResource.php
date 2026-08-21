<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LibraryResource extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'description',
        'resource_type',
        'file_path',
        'file_size',
        'mime_type',
        'cover_image',
        'language',
        'is_public',
        'download_allowed',
        'is_active',
        'view_count',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'is_public' => 'boolean',
            'download_allowed' => 'boolean',
            'is_active' => 'boolean',
            'view_count' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $resource) {
            if (empty($resource->slug)) {
                $resource->slug = \Illuminate\Support\Str::slug($resource->title).'-'.
                    \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(6));
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LibraryCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(LibraryAuthor::class, 'author_id');
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(LibraryBorrowing::class, 'resource_id');
    }

    public function activeBorrowing(): ?LibraryBorrowing
    {
        return $this->borrowings()->whereIn('status', ['borrowed', 'overdue'])->latest('borrowed_at')->first();
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(LibraryReservation::class, 'resource_id');
    }

    public function readingHistory(): HasMany
    {
        return $this->hasMany(LibraryReadingHistory::class, 'resource_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function isBorrowed(): bool
    {
        return $this->borrowings()->whereIn('status', ['borrowed', 'overdue'])->exists();
    }

    public function hasPendingReservation(): bool
    {
        return $this->reservations()->where('status', 'pending')->exists();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByType($query, ?string $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('resource_type', $type);
        }

        return $query;
    }

    public function scopeByCategory($query, ?int $categoryId)
    {
        if ($categoryId) {
            return $query->where('category_id', $categoryId);
        }

        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhereHas('author', fn ($a) => $a->where('name', 'like', "%{$term}%"));
            });
        }

        return $query;
    }
}
