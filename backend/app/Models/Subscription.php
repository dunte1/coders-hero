<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subscription extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id',
        'plan',
        'amount',
        'status',
        'payment_method',
        'payment_reference',
        'starts_at',
        'ends_at',
        'next_billing_date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'starts_at' => 'date',
            'ends_at' => 'date',
            'next_billing_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
