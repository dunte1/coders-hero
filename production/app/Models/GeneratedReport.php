<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneratedReport extends Model
{
    protected $fillable = [
        'report_type',
        'title',
        'period',
        'generated_at',
        'file_path',
        'file_size',
        'format',
        'generated_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'generated_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function getDownloadUrlAttribute(): string
    {
        return url('/api/reports/download/' . $this->id);
    }

    public function getFileSizeFormattedAttribute(): string
    {
        if (!$this->file_size) return '—';

        $bytes = (int) $this->file_size;
        if ($bytes >= 1048576) return round($bytes / 1048576, 1) . ' MB';
        if ($bytes >= 1024) return round($bytes / 1024, 1) . ' KB';
        return $bytes . ' B';
    }
}
