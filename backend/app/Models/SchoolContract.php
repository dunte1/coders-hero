<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SchoolContract extends Model
{
    use HasActivity;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'partner_school_id',
        'contract_number',
        'title',
        'description',
        'value',
        'start_date',
        'end_date',
        'renewal_date',
        'status',
        'document_path',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'renewal_date' => 'date',
        ];
    }

    public function partnerSchool(): BelongsTo
    {
        return $this->belongsTo(PartnerSchool::class);
    }
}
