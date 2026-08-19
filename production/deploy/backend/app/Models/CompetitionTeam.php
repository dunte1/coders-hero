<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompetitionTeam extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'competition_id',
        'name',
        'project_title',
        'description',
        'status',
        'leader_student_id',
        'submission_url',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function leader(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'leader_student_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'competition_team_members', 'competition_team_id', 'student_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function scores(): HasMany
    {
        return $this->hasMany(CompetitionScore::class, 'competition_team_id');
    }

    public function hasMember(int $studentId): bool
    {
        return $this->members()->where('students.id', $studentId)->exists();
    }

    public function isFull(): bool
    {
        return $this->members()->count() >= (int) ($this->competition?->max_team_size ?? PHP_INT_MAX);
    }

    public function isLeader(Student $student): bool
    {
        return $this->leader_student_id === $student->id;
    }

    public function hasSubmitted(): bool
    {
        return $this->status === 'submitted';
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('project_title', 'like', "%{$term}%");
            });
        }

        return $query;
    }
}
