<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('inspire')->hourly();

// Generate monthly reports on the 1st of every month at 2:00 AM
Schedule::command('reports:monthly')->daily()->at('02:00');
