<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryBorrowing extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'resource_id',
        'user_id',
        'borrowed_at',
        'due_at',
        'returned_at',
        'status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'borrowed_at' => 'datetime',
            'due_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(LibraryResource::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isOverdue(): bool
    {
        return $this->status === 'borrowed' && $this->due_at && $this->due_at->isPast();
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['borrowed', 'overdue']);
    }
}
