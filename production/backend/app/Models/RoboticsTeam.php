<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoboticsTeam extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'mentor_user_id',
        'status',
    ];

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_user_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'robotics_team_student', 'team_id', 'student_id')
            ->withTimestamps()
            ->withPivot('role')
            ->using(RoboticsTeamStudent::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(RoboticsProject::class, 'team_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(RoboticsEquipmentAssignment::class, 'assignable_id')
            ->where('assignable_type', static::class);
    }

    public function hasMember(int $studentId): bool
    {
        return $this->members()->where('students.id', $studentId)->exists();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            return $query->where('name', 'like', "%{$term}%");
        }

        return $query;
    }
}
