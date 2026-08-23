<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'organization',
        'email',
        'phone',
        'source',
        'status',
        'owner_id',
        'notes',
        'next_follow_up_at',
    ];

    protected function casts(): array
    {
        return [
            'next_follow_up_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeByStatus($query, ?string $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }

        return $query;
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['new', 'contacted', 'qualified']);
    }
}
