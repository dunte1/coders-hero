<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentAnalytic extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'lessons_completed',
        'quizzes_taken',
        'exercises_solved',
        'minutes_learned',
        'points_earned',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'lessons_completed' => 'integer',
            'quizzes_taken' => 'integer',
            'exercises_solved' => 'integer',
            'minutes_learned' => 'integer',
            'points_earned' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
