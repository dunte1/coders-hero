<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreeTrialBooking extends Model
{
    protected $fillable = [
        'parent_name',
        'phone',
        'email',
        'child_name',
        'grade',
        'status',
        'notes',
        'contacted_at',
        'scheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'contacted_at' => 'datetime',
            'scheduled_at' => 'datetime',
        ];
    }
}
