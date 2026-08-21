<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDelivery extends Model
{
    protected $table = 'notification_deliveries';

    protected $fillable = [
        'notification_id',
        'channel',
        'status',
        'provider_reference',
        'sent_at',
        'delivered_at',
        'failed_at',
        'error_message',
        'retry_count',
        'last_retried_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'sent_at' => 'datetime',
            'delivered_at' => 'datetime',
            'failed_at' => 'datetime',
            'last_retried_at' => 'datetime',
        ];
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class);
    }

    public function isCompleted(): bool
    {
        return in_array($this->status, ['delivered', 'failed']);
    }

    public function scopeOfStatus($query, ?string $status)
    {
        if (!$status || $status === 'all') {
            return $query;
        }

        return $query->where('status', $status);
    }

    public function scopeOfChannel($query, ?string $channel)
    {
        if (!$channel || $channel === 'all') {
            return $query;
        }

        return $query->where('channel', $channel);
    }

    public function markSending(): void
    {
        $this->update([
            'status' => 'sending',
            'sent_at' => $this->sent_at ?? now(),
        ]);
    }

    public function markDelivered(?string $reference = null): void
    {
        $this->update([
            'status' => 'delivered',
            'provider_reference' => $reference ?: $this->provider_reference,
            'sent_at' => $this->sent_at ?? now(),
            'delivered_at' => $this->delivered_at ?? now(),
            'failed_at' => null,
            'error_message' => null,
        ]);
    }

    public function markFailed(string $message): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => $this->failed_at ?? now(),
            'error_message' => $message,
        ]);
    }

    public function markQueued(): void
    {
        $this->update([
            'status' => 'queued',
            'failed_at' => null,
            'error_message' => null,
        ]);
    }
}
