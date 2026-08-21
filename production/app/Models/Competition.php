<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Competition extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    public const TYPES = [
        'hackathon',
        'robotics_challenge',
        'ai_challenge',
        'web_design',
        'mobile_app',
    ];

    public const STATUSES = [
        'draft',
        'registration_open',
        'registration_closed',
        'ongoing',
        'completed',
        'cancelled',
    ];

    protected $fillable = [
        'name',
        'slug',
        'type',
        'description',
        'rules',
        'venue',
        'start_date',
        'end_date',
        'registration_deadline',
        'min_team_size',
        'max_team_size',
        'status',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'rules' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'registration_deadline' => 'datetime',
            'min_team_size' => 'integer',
            'max_team_size' => 'integer',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function criteria(): HasMany
    {
        return $this->hasMany(CompetitionCriterion::class, 'competition_id')->orderBy('sort_order');
    }

    public function teams(): HasMany
    {
        return $this->hasMany(CompetitionTeam::class, 'competition_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(CompetitionScore::class, 'competition_id');
    }

    public function judges(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'competition_judges', 'competition_id', 'user_id')
            ->withTimestamps()
            ->withPivot('title');
    }

    public function hasJudge(string|int $userId): bool
    {
        return $this->judges()->where('users.id', $userId)->exists();
    }

    public function isPublished(): bool
    {
        return !in_array($this->status, ['draft', 'cancelled'], true);
    }

    public function isRegistrationOpen(): bool
    {
        return $this->status === 'registration_open'
            && ($this->registration_deadline === null || $this->registration_deadline->isFuture());
    }

    public function allowsScoring(): bool
    {
        return in_array($this->status, ['registration_closed', 'ongoing', 'completed'], true);
    }

    public function scopeByType($query, ?string $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('type', $type);
        }

        return $query;
    }

    public function scopeByStatus($query, ?string $status)
    {
        if ($status && $status !== 'all') {
            return $query->where('status', $status);
        }

        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('venue', 'like', "%{$term}%");
            });
        }

        return $query;
    }
}
