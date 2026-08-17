<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assignment extends Model
{
    use HasFactory;
    use HasActivity;
    use SoftDeletes;

    protected $fillable = [
        'teacher_user_id',
        'class_id',
        'course_id',
        'title',
        'description',
        'instructions',
        'type',
        'max_score',
        'due_at',
        'published_at',
        'status',
        'attachments',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'due_at' => 'datetime',
            'published_at' => 'datetime',
            'max_score' => 'decimal:2',
            'attachments' => 'array',
            'settings' => 'array',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_user_id');
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function gradedSubmissions(): HasMany
    {
        return $this->submissions()->where('status', 'graded');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeByTeacher($query, string $teacherUserId)
    {
        return $query->where('teacher_user_id', $teacherUserId);
    }

    public function getSubmissionCountAttribute(): int
    {
        return $this->submissions()->count();
    }

    public function getGradedCountAttribute(): int
    {
        return $this->gradedSubmissions()->count();
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_at !== null && $this->due_at->isPast() && $this->status === 'published';
    }
}
