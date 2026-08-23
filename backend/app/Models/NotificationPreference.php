<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $table = 'notification_preferences';

    protected $fillable = [
        'user_id',
        'category',
        'email',
        'sms',
        'push',
        'in_app',
        'whatsapp',
    ];

    protected function casts(): array
    {
        return [
            'email' => 'boolean',
            'sms' => 'boolean',
            'push' => 'boolean',
            'in_app' => 'boolean',
            'whatsapp' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
