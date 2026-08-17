<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'student_id',
        'blood_type',
        'height_cm',
        'weight_kg',
        'allergies',
        'conditions',
        'medications',
        'dietary_restrictions',
        'doctor_name',
        'doctor_phone',
        'insurance_provider',
        'insurance_policy_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'allergies' => 'array',
            'conditions' => 'array',
            'medications' => 'array',
            'dietary_restrictions' => 'array',
            'height_cm' => 'decimal:2',
            'weight_kg' => 'decimal:2',
        ];
    }

    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function hasAllergies(): bool
    {
        return !empty($this->allergies);
    }
}
