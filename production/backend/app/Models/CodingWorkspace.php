<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodingWorkspace extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'user_id',
        'course_id',
        'name',
        'language',
        'files',
        'active_file',
        'saved_at',
    ];

    protected function casts(): array
    {
        return [
            'files' => 'array',
            'saved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}