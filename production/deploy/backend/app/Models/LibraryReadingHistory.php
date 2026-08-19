<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryReadingHistory extends Model
{
    use HasActivity;
    use HasFactory;

    protected $table = 'library_reading_history';

    protected $fillable = [
        'resource_id',
        'user_id',
        'read_at',
        'times_read',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'times_read' => 'integer',
        ];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(LibraryResource::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
