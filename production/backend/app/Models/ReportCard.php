<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReportCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'term',
        'academic_year',
        'issued_at',
        'overall_grade',
        'average_score',
        'teacher_notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date:Y-m-d',
            'average_score' => 'decimal:2',
        ];
    }

    protected $appends = ['items_count'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReportCardItem::class)->orderBy('id');
    }

    public function getItemsCountAttribute(): int
    {
        return $this->relationLoaded('items') ? $this->items->count() : $this->items()->count();
    }
}
