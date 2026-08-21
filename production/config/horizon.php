<?php

return [

    'environments' => [
        'production' => [
            'supervisor-1' => [
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
                'queue' => ['default', 'emails', 'notifications', 'reports'],
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'maxProcesses' => 3,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
                'queue' => ['default', 'emails', 'notifications', 'reports'],
            ],
        ],
    ],
];
