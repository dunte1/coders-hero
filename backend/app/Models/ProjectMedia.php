<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMedia extends Model
{
    protected $fillable = ['project_id', 'type', 'path', 'original_name', 'sort_order'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(StudentProject::class, 'project_id');
    }
}
