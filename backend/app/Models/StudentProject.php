<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class StudentProject extends Model
{
    use HasActivity, HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id', 'user_id', 'title', 'slug', 'problem_statement',
        'description', 'technologies', 'repo_url', 'demo_url', 'source_path',
        'final_score', 'is_published', 'published_at', 'status', 'version_number',
    ];

    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (StudentProject $project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->title);
            }
        });

        static::updating(function (StudentProject $project) {
            if ($project->isDirty('title') && !$project->isDirty('slug')) {
                $project->slug = Str::slug($project->title);
            }
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ProjectMedia::class, 'project_id')->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProjectReview::class, 'project_id')->latest();
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }
}
