<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompetitionCriterion extends Model
{
    use HasActivity;
    use HasFactory;

    protected $fillable = [
        'competition_id',
        'name',
        'description',
        'max_score',
        'weight',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'max_score' => 'integer',
            'weight' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competition_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(CompetitionScore::class, 'criterion_id');
    }
}
