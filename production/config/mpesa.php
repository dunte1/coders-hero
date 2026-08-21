<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    | sandbox or live. Sandbox hits the Safaricom sandbox API (no real money).
    */
    'env' => env('MPESA_ENV', 'sandbox'),

    'consumer_key' => env('MPESA_CONSUMER_KEY'),
    'consumer_secret' => env('MPESA_CONSUMER_SECRET'),
    'passkey' => env('MPESA_PASSKEY'),
    'shortcode' => env('MPESA_SHORTCODE', '174379'),

    'base_url' => env(
        'MPESA_BASE_URL',
        env('MPESA_ENV') === 'live'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke'
    ),

    'callback_url' => env('MPESA_CALLBACK_URL'),
];
