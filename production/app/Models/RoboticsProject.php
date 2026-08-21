<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoboticsProject extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'team_id',
        'student_id',
        'title',
        'description',
        'category',
        'status',
        'start_date',
        'deadline',
        'completed_at',
        'goals',
    ];

    protected function casts(): array
    {
        return [
            'goals' => 'array',
            'start_date' => 'date',
            'deadline' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(RoboticsTeam::class, 'team_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(RoboticsProjectSubmission::class, 'project_id')->orderByDesc('created_at');
    }

    public function latestSubmission()
    {
        return $this->hasOne(RoboticsProjectSubmission::class, 'project_id')->latestOfMany();
    }

    public function isOwnedByStudent(int $studentId): bool
    {
        if ($this->student_id !== null && $this->student_id === $studentId) {
            return true;
        }

        return $this->team_id !== null && $this->team->hasMember($studentId);
    }

    public function scopeByCategory($query, ?string $category)
    {
        if ($category && $category !== 'all') {
            return $query->where('category', $category);
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
            return $query->where('title', 'like', "%{$term}%");
        }

        return $query;
    }
}
