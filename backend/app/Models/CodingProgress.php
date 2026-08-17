<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodingProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'skill',
        'level',
        'progress',
        'badge',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'progress' => 'integer',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }
}
