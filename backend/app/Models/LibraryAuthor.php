<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryAuthor extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'name',
        'bio',
        'created_by_user_id',
    ];

    public function resources(): HasMany
    {
        return $this->hasMany(LibraryResource::class, 'author_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where('name', 'like', "%{$term}%");
        }

        return $query;
    }
}
