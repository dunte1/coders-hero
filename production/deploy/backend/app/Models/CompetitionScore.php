<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionScore extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'competition_id',
        'competition_team_id',
        'criterion_id',
        'judge_user_id',
        'score',
        'remarks',
        'submitted_at',
        'verified_by_user_id',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(CompetitionTeam::class, 'competition_team_id');
    }

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(CompetitionCriterion::class, 'criterion_id');
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_user_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }
}
