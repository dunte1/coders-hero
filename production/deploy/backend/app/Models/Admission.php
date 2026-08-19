<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Admission extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'application_number',
        'student_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'guardian_name',
        'guardian_phone',
        'guardian_email',
        'program_of_interest',
        'grade',
        'preferred_branch',
        'status',
        'applied_at',
        'decided_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'applied_at' => 'date',
            'decided_at' => 'date',
        ];
    }

    protected $appends = [
        'full_name',
    ];

    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class);
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
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('application_number', 'like', "%{$term}%")
                    ->orWhere('guardian_name', 'like', "%{$term}%");
            });
        }
        return $query;
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function isAdmitted(): bool
    {
        return $this->status === 'admitted';
    }
}
