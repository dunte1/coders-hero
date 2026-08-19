<?php

namespace App\Models;

use App\Traits\HasActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    use HasActivity;
    use HasFactory;

    public $timestamps = true;

    protected $fillable = [
        'path',
        'referrer',
        'user_agent',
        'ip_address',
        'visitor_id',
        'is_mobile',
    ];

    protected function casts(): array
    {
        return [
            'is_mobile' => 'boolean',
        ];
    }
}
