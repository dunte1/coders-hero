<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'fee_id',
        'invoice_id',
        'receipt_no',
        'amount',
        'method',
        'reference',
        'paid_at',
        'paid_by_user_id',
        'reversal_reason',
        'reversed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date:Y-m-d',
            'reversed_at' => 'datetime',
        ];
    }

    public function fee(): BelongsTo
    {
        return $this->belongsTo(Fee::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by_user_id');
    }

    public function mpesaTransaction(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MpesaTransaction::class, 'payment_id');
    }
}
