<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolClass extends Model
{
    use HasFactory;
    use HasActivity;
    use SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'teacher_user_id',
        'name',
        'subject',
        'description',
        'room',
        'color',
        'schedule',
        'status',
        'capacity',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'schedule' => 'array',
            'settings' => 'array',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_user_id');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'class_student', 'class_id', 'student_id')
            ->withTimestamps()
            ->withPivot('enrolled_at')
            ->using(ClassStudent::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class, 'class_id');
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class, 'class_id');
    }

    public function gradebookEntries(): HasMany
    {
        return $this->hasMany(GradebookEntry::class, 'class_id');
    }

    public function lessonNotes(): HasMany
    {
        return $this->hasMany(LessonNote::class, 'class_id');
    }

    public function calendarEvents(): HasMany
    {
        return $this->hasMany(CalendarEvent::class, 'class_id');
    }

    public function getStudentCountAttribute(): int
    {
        return $this->students()->count();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByTeacher($query, string $teacherUserId)
    {
        return $query->where('teacher_user_id', $teacherUserId);
    }
}
