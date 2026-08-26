<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'invoice_no',
        'student_id',
        'fee_structure_id',
        'term',
        'description',
        'amount',
        'paid_amount',
        'status',
        'due_date',
        'issued_at',
        'created_by_user_id',
    ];

    protected $appends = [
        'balance',
        'is_overdue',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_date' => 'date:Y-m-d',
            'issued_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'invoice_id')->orderByDesc('paid_at');
    }

    public function mpesaTransactions(): HasMany
    {
        return $this->hasMany(MpesaTransaction::class, 'invoice_id');
    }

    public function getBalanceAttribute(): float
    {
        return round(max(0, (float) $this->amount - (float) $this->paid_amount), 2);
    }

    public function getIsOverdueAttribute(): bool
    {
        return in_array($this->status, ['issued', 'partial'], true)
            && $this->due_date
            && $this->due_date->lt(now()->startOfDay());
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isVoid(): bool
    {
        return $this->status === 'void';
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['draft', 'issued', 'partial'], true);
    }

    /**
     * Recompute paid_amount and status from recorded payments.
     */
    public function recalculateFromPayments(): void
    {
        $paid = (float) $this->payments()->sum('amount');

        $this->paid_amount = round($paid, 2);

        if ($this->isVoid()) {
            $this->save();
            return;
        }

        if ($paid >= (float) $this->amount) {
            $this->status = 'paid';
        } elseif ($paid > 0) {
            $this->status = 'partial';
        } else {
            $this->status = $this->due_date && $this->due_date->lt(now()->startOfDay()) ? 'overdue' : 'issued';
        }

        $this->save();
    }
}
