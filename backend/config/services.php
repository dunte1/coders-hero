<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'enabled' => env('OPENAI_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Code Runner (isolated execution)
    |--------------------------------------------------------------------------
    |
    | User code is NEVER executed on the Laravel application server. Code runs
    | inside an isolated, sandboxed execution engine (Piston by default) with
    | CPU, memory, time and network resource limits enforced at the container
    | level. See docs/CODE_RUNNER_ARCHITECTURE.md.
    |
    */
    'whatsapp' => [
        'token' => env('WHATSAPP_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'from_number' => env('WHATSAPP_FROM_NUMBER'),
    ],

    'code_runner' => [
        'enabled' => env('CODE_RUNNER_ENABLED', false),
        'url' => env('CODE_RUNNER_URL'),
        'token' => env('CODE_RUNNER_TOKEN'),
        'timeout' => (int) env('CODE_RUNNER_TIMEOUT', 30),
        'run_timeout_ms' => (int) env('CODE_RUNNER_RUN_TIMEOUT_MS', 10000),
        'compile_timeout_ms' => (int) env('CODE_RUNNER_COMPILE_TIMEOUT_MS', 15000),
        'memory_limit_kb' => (int) env('CODE_RUNNER_MEMORY_LIMIT_KB', 256000),
        // Languages that can be executed by the isolated runner.
        'languages' => [
            'python' => ['label' => 'Python', 'entry' => 'main.py', 'piston' => 'python'],
            'javascript' => ['label' => 'JavaScript', 'entry' => 'main.js', 'piston' => 'javascript'],
        ],
        // Web languages rendered client-side in a sandboxed iframe preview.
        'web_languages' => [
            'html' => ['label' => 'HTML', 'entry' => 'index.html'],
            'css' => ['label' => 'CSS', 'entry' => 'style.css'],
        ],
    ],

];
