<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quiz_id',
        'score',
        'answers',
        'started_at',
        'completed_at',
        'is_passed',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'answers' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'is_passed' => 'boolean',
        ];
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quiz(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePassed($query)
    {
        return $query->where('is_passed', true);
    }

    public function scopeForQuiz($query, int $quizId)
    {
        return $query->where('quiz_id', $quizId);
    }

    public function getDurationAttribute(): ?int
    {
        if ($this->started_at && $this->completed_at) {
            return (int) $this->started_at->diffInMinutes($this->completed_at);
        }
        return null;
    }
}
