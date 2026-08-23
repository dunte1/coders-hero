<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'amount',
        'approval_status',
        'submitted_by',
        'approved_by',
        'rejection_reason',
        'approved_at',
        'expense_date',
        'recorded_by_user_id',
        'receipt_ref',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expense_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopeByCategory($query, ?string $category)
    {
        if ($category) {
            return $query->where('category', $category);
        }
        return $query;
    }

    public function scopeByApprovalStatus($query, ?string $status)
    {
        if ($status) {
            return $query->where('approval_status', $status);
        }
        return $query;
    }
}
