<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LessonNote extends Model
{
    use HasFactory;
    use HasActivity;
    use SoftDeletes;

    protected $fillable = [
        'teacher_user_id',
        'lesson_id',
        'class_id',
        'title',
        'content',
        'attachments',
        'note_date',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'note_date' => 'date',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_user_id');
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function scopeByTeacher($query, string $teacherUserId)
    {
        return $query->where('teacher_user_id', $teacherUserId);
    }
}
