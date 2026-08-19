<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessage extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'prompt_tokens',
        'completion_tokens',
        'total_tokens',
        'cost',
        'model',
        'latency_ms',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'cost' => 'decimal:6',
            'meta' => 'array',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id', 'id');
    }
}
