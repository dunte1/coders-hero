<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'student_id',
        'guardian_id',
        'user_id',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'photo',
        'grade',
        'branch',
        'admission_date',
        'status',
        'qr_code',
        'graduation_date',
        'medical_notes',
    ];

    protected $appends = [
        'full_name',
        'age',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'admission_date' => 'date',
            'graduation_date' => 'date',
        ];
    }

    public function guardian(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function medicalRecord(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MedicalRecord::class);
    }

    public function attendances(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function documents(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function timeline(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StudentTimelineEntry::class)->orderByDesc('occurred_on');
    }

    public function reportCards(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReportCard::class)->orderByDesc('issued_at');
    }

    public function codingProgress(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CodingProgress::class)->orderBy('skill');
    }

    public function fees(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Fee::class)->orderByDesc('due_date');
    }

    public function appointments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function schoolClasses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(SchoolClass::class, 'class_student', 'student_id', 'class_id')
            ->withTimestamps()
            ->withPivot('enrolled_at')
            ->using(ClassStudent::class);
    }

    public function assignmentSubmissions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }

    public function examResults(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    public function gradebookEntries(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(GradebookEntry::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByStatus($query, ?string $status)
    {
        if ($status && $status !== 'all') {
            return $query->where('status', $status);
        }
        return $query;
    }

    public function scopeByGrade($query, ?string $grade)
    {
        if ($grade && $grade !== 'all') {
            return $query->where('grade', $grade);
        }
        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('student_id', 'like', "%{$term}%");
            });
        }
        return $query;
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo) {
            return asset('storage/' . $this->photo);
        }
        return null;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isGraduated(): bool
    {
        return $this->status === 'graduated';
    }
}
