<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEvent extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'user_id',
        'class_id',
        'title',
        'description',
        'event_type',
        'starts_at',
        'ends_at',
        'all_day',
        'location',
        'color',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'all_day' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function scopeBetween($query, string $from, string $to)
    {
        return $query->where(function ($q) use ($from, $to) {
            $q->whereBetween('starts_at', [$from, $to])
                ->orWhereBetween('ends_at', [$from, $to])
                ->orWhere(function ($inner) use ($from, $to) {
                    $inner->where('starts_at', '<=', $from)
                        ->where('ends_at', '>=', $to);
                });
        });
    }
}
