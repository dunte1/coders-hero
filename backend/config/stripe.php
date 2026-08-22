<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Stripe API Keys
    |--------------------------------------------------------------------------
    */
    'secret_key' => env('STRIPE_SECRET_KEY'),
    'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Currency
    |--------------------------------------------------------------------------
    */
    'currency' => env('STRIPE_CURRENCY', 'usd'),

    /*
    |--------------------------------------------------------------------------
    | Success / Cancel URLs
    |--------------------------------------------------------------------------
    */
    'success_url' => env('STRIPE_SUCCESS_URL', 'http://localhost:5173/finance/mine?payment=success'),
    'cancel_url' => env('STRIPE_CANCEL_URL', 'http://localhost:5173/finance/mine?payment=cancelled'),

];
