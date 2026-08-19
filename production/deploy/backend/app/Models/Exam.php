<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exam extends Model
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
        'type',
        'scheduled_at',
        'duration_minutes',
        'total_marks',
        'passing_marks',
        'status',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'total_marks' => 'decimal:2',
            'passing_marks' => 'decimal:2',
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

    public function results(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function scopeScheduled($query)
    {
        return $query->whereIn('status', ['scheduled', 'in_progress', 'completed']);
    }

    public function scopeByTeacher($query, string $teacherUserId)
    {
        return $query->where('teacher_user_id', $teacherUserId);
    }
}
