<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodingSubmission extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'exercise_id',
        'user_id',
        'code',
        'status',
        'score',
        'result',
        'feedback',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'result' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(CodingExercise::class, 'exercise_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }
}
