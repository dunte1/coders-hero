<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $table = 'notification_templates';

    protected $fillable = [
        'event',
        'name',
        'description',
        'category',
        'subject',
        'body',
        'channels',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'channels' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function defaultChannels(): array
    {
        $channels = $this->channels;

        return is_array($channels) && count($channels) > 0
            ? $channels
            : ['in_app', 'email'];
    }

    public function scopeWithCategory($query, ?string $category)
    {
        if (!$category || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
    }
}
