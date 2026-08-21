<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    use HasUuids;

    protected $table = 'notifications';

    protected $fillable = [
        'type',
        'category',
        'channel',
        'status',
        'notifiable_type',
        'notifiable_id',
        'data',
        'link',
        'metadata',
        'read_at',
        'sent_at',
        'delivered_at',
        'failed_at',
        'error_message',
        'retry_count',
        'last_retried_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'metadata' => 'array',
            'read_at' => 'datetime',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'failed_at' => 'datetime',
            'last_retried_at' => 'datetime',
        ];
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(NotificationDelivery::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, string $userId)
    {
        return $query->where('notifiable_type', User::class)
            ->where('notifiable_id', $userId);
    }

    public function scopeOfCategory($query, ?string $category)
    {
        if (!$category || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
    }

    public function scopeOfChannel($query, ?string $channel)
    {
        if (!$channel || $channel === 'all') {
            return $query;
        }

        return $query->where('channel', $channel);
    }

    public function scopeOfStatus($query, ?string $status)
    {
        if (!$status || $status === 'all') {
            return $query;
        }

        return $query->where('status', $status);
    }

    public function scopeOfReadStatus($query, ?bool $isRead)
    {
        if ($isRead === null) {
            return $query;
        }

        return $isRead ? $query->read() : $query->unread();
    }

    public function scopeInInbox($query)
    {
        return $query->where(function ($q) {
            $q->where('metadata->in_inbox', true)
                ->orWhereNull('metadata');
        });
    }

    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    public function markAsUnread(): void
    {
        $this->update(['read_at' => null]);
    }

    public function read(): bool
    {
        return $this->read_at !== null;
    }

    public function unread(): bool
    {
        return !$this->read();
    }

    public function markFailed(string $message): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => $this->failed_at ?? now(),
            'error_message' => $message,
        ]);
    }

    public function markDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => $this->delivered_at ?? now(),
            'sent_at' => $this->sent_at ?? now(),
        ]);
    }

    public function markSending(): void
    {
        $this->update([
            'status' => 'sending',
            'sent_at' => $this->sent_at ?? now(),
        ]);
    }
}
