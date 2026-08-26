<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Subscription Plans & Pricing
    |--------------------------------------------------------------------------
    |
    | Centralized pricing for all subscription plans. Update prices here
    | rather than hardcoding in controllers.
    |
    */

    'plans' => [
        'monthly' => [
            'name' => 'Monthly',
            'amount' => 2500,
            'currency' => 'KES',
            'interval' => 'month',
        ],
        'termly' => [
            'name' => 'Termly',
            'amount' => 6000,
            'currency' => 'KES',
            'interval' => 'month',
            'interval_count' => 3,
        ],
        'annual' => [
            'name' => 'Annual',
            'amount' => 15000,
            'currency' => 'KES',
            'interval' => 'year',
        ],
    ],

];
