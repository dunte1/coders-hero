<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoboticsProjectSubmission extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'project_id',
        'submitted_by_user_id',
        'title',
        'description',
        'files',
        'repo_url',
        'demo_url',
        'status',
        'score',
        'feedback',
        'reviewed_by_user_id',
        'reviewed_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'files' => 'array',
            'score' => 'integer',
            'reviewed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(RoboticsProject::class, 'project_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function isReviewed(): bool
    {
        return in_array($this->status, ['approved', 'rejected'], true);
    }
}
