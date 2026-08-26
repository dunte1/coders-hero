<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('inspire')->hourly();

// Generate monthly reports on the 1st of every month at 2:00 AM
Schedule::command('reports:monthly')->daily()->at('02:00');

// Clean up old activity logs (older than 90 days)
Schedule::command('activitylog:clean', ['--days=90'])->daily()->at('03:00');

// Clean up expired sessions
Schedule::command('session:gc')->daily()->at('03:30');

// Clean up failed jobs older than 30 days
Schedule::command('queue:prune-failed', ['--days=30'])->daily()->at('04:00');
