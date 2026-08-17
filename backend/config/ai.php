<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default AI Provider
    |--------------------------------------------------------------------------
    | Which provider driver to use. 'openai' is the built-in driver; the
    | AiProviderManager abstraction allows swapping in other providers later.
    */
    'default_provider' => env('AI_PROVIDER', 'openai'),

    /*
    |--------------------------------------------------------------------------
    | Provider Drivers
    |--------------------------------------------------------------------------
    */
    'providers' => [
        'openai' => [
            'driver' => \App\Services\AI\OpenAiProvider::class,
            'api_key' => env('OPENAI_API_KEY'),
            'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
            'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
            'enabled' => env('OPENAI_ENABLED', true),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Model Catalog & Pricing (USD per 1M tokens)
    |--------------------------------------------------------------------------
    | Used for token/cost tracking. Adjust prices to match your provider billing.
    */
    'models' => [
        'gpt-4o-mini' => ['prompt' => 0.15, 'completion' => 0.60],
        'gpt-4o' => ['prompt' => 2.50, 'completion' => 10.00],
        'gpt-4.1-mini' => ['prompt' => 0.40, 'completion' => 1.60],
        'gpt-4.1' => ['prompt' => 2.00, 'completion' => 8.00],
    ],

    'default_model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    'max_tokens' => env('AI_MAX_TOKENS', 800),
    'temperature' => 0.7,
    'timeout' => 45,

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    | Per-user sliding-window limits enforced by the AiPlatformService.
    */
    'rate_limits' => [
        'messages_per_minute' => (int) env('AI_MESSAGES_PER_MINUTE', 15),
        'messages_per_day' => (int) env('AI_MESSAGES_PER_DAY', 300),
        'window_minutes' => 1,
    ],

    /*
    |--------------------------------------------------------------------------
    | Safety Controls
    |--------------------------------------------------------------------------
    */
    'safety' => [
        // Maximum characters accepted per user message.
        'max_message_length' => 4000,
        // Blocked words that trigger a friendly refusal (lowercase).
        'blocked_words' => [
            'hack this school', 'inject sql', 'bypass grades', 'cheat exam',
            'steal passwords', 'ddos', 'phishing script', 'credit card generator',
        ],
        // Enable OpenAI content moderation when a key is available.
        'moderation' => (bool) env('AI_MODERATION_ENABLED', false),
    ],

    // How many recent messages are sent as conversation history.
    'history_limit' => 12,

];
