<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceReview extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'employee_id',
        'reviewer_user_id',
        'review_period',
        'review_date',
        'rating',
        'goals',
        'achievements',
        'areas_to_improve',
        'feedback',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'review_date' => 'date',
            'rating' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
