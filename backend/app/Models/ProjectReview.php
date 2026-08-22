<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectReview extends Model
{
    use HasActivity, HasFactory;

    protected $fillable = ['project_id', 'reviewer_id', 'score', 'feedback', 'status'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(StudentProject::class, 'project_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
