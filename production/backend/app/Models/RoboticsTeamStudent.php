<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class RoboticsTeamStudent extends Pivot
{
    public $timestamps = true;

    protected $table = 'robotics_team_student';

    protected $fillable = [
        'team_id',
        'student_id',
        'role',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(RoboticsTeam::class, 'team_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
