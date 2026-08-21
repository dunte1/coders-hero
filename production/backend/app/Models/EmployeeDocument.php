<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    use HasFactory;
    use HasActivity;

    protected $fillable = [
        'employee_id',
        'title',
        'category',
        'file_path',
        'file_name',
        'mime_type',
        'size',
        'uploaded_by_user_id',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
