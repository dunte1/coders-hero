<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VideoProgress extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'lesson_id',
        'user_id',
        'watched_seconds',
        'duration_seconds',
        'completed',
        'last_watched_at',
    ];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'last_watched_at' => 'datetime',
        ];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getProgressAttribute(): int
    {
        if ($this->duration_seconds <= 0) {
            return $this->completed ? 100 : 0;
        }

        return min(100, (int) round(($this->watched_seconds / $this->duration_seconds) * 100));
    }
}
