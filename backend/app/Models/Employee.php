<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory;
    use HasActivity;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'employee_id',
        'department_id',
        'position_id',
        'date_of_birth',
        'gender',
        'national_id',
        'address',
        'emergency_contact',
        'emergency_phone',
        'bank_name',
        'bank_account_number',
        'hire_date',
        'employment_type',
        'salary',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'date_of_birth' => 'date',
            'salary' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(EmployeeContract::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function performanceReviews(): HasMany
    {
        return $this->hasMany(PerformanceReview::class);
    }

    public function staffAttendance(): HasMany
    {
        return $this->hasMany(StaffAttendance::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function activeContract(): ?EmployeeContract
    {
        return $this->contracts()
            ->where('status', 'active')
            ->orderByDesc('start_date')
            ->first();
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('employment_type', $type);
    }

    public function getTenureAttribute(): ?int
    {
        return $this->hire_date ? $this->hire_date->diffInYears(now()) : null;
    }
}
