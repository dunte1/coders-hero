<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTimelineEntry extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'student_id',
        'event_type',
        'title',
        'description',
        'occurred_on',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'occurred_on' => 'date',
            'meta' => 'array',
        ];
    }

    public function student(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function scopeByType($query, ?string $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('event_type', $type);
        }
        return $query;
    }
}
