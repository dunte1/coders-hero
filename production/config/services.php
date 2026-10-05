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
        // 'piston' => reaches the isolated Piston API at CODE_RUNNER_URL.
        // 'native' => executes locally via installed runtimes (php/python3/node/gcc/g++/ruby/perl/bash).
        'driver' => env('CODE_RUNNER_DRIVER', 'piston'),
        'url' => env('CODE_RUNNER_URL'),
        'token' => env('CODE_RUNNER_TOKEN'),
        'timeout' => (int) env('CODE_RUNNER_TIMEOUT', 30),
        'run_timeout_ms' => (int) env('CODE_RUNNER_RUN_TIMEOUT_MS', 10000),
        'compile_timeout_ms' => (int) env('CODE_RUNNER_COMPILE_TIMEOUT_MS', 15000),
        'memory_limit_kb' => (int) env('CODE_RUNNER_MEMORY_LIMIT_KB', 256000),
        // Languages that can be executed by the isolated runner.
        // Each entry: label (UI), entry (default file name), piston (runner language slug).
        'languages' => [
            'python' => ['label' => 'Python', 'entry' => 'main.py', 'piston' => 'python'],
            'javascript' => ['label' => 'JavaScript', 'entry' => 'main.js', 'piston' => 'javascript'],
            'typescript' => ['label' => 'TypeScript', 'entry' => 'main.ts', 'piston' => 'typescript'],
            'java' => ['label' => 'Java', 'entry' => 'Main.java', 'piston' => 'java'],
            'cpp' => ['label' => 'C++', 'entry' => 'main.cpp', 'piston' => 'c++'],
            'c' => ['label' => 'C', 'entry' => 'main.c', 'piston' => 'c'],
            'csharp' => ['label' => 'C#', 'entry' => 'main.cs', 'piston' => 'csharp'],
            'go' => ['label' => 'Go', 'entry' => 'main.go', 'piston' => 'go'],
            'rust' => ['label' => 'Rust', 'entry' => 'main.rs', 'piston' => 'rust'],
            'ruby' => ['label' => 'Ruby', 'entry' => 'main.rb', 'piston' => 'ruby'],
            'php' => ['label' => 'PHP', 'entry' => 'main.php', 'piston' => 'php'],
            'kotlin' => ['label' => 'Kotlin', 'entry' => 'Main.kt', 'piston' => 'kotlin'],
            'swift' => ['label' => 'Swift', 'entry' => 'main.swift', 'piston' => 'swift'],
            'dart' => ['label' => 'Dart', 'entry' => 'main.dart', 'piston' => 'dart'],
            'bash' => ['label' => 'Bash', 'entry' => 'main.sh', 'piston' => 'bash'],
            'lua' => ['label' => 'Lua', 'entry' => 'main.lua', 'piston' => 'lua'],
            'perl' => ['label' => 'Perl', 'entry' => 'main.pl', 'piston' => 'perl'],
            'r' => ['label' => 'R', 'entry' => 'main.r', 'piston' => 'r'],
            'scala' => ['label' => 'Scala', 'entry' => 'main.scala', 'piston' => 'scala'],
            'haskell' => ['label' => 'Haskell', 'entry' => 'main.hs', 'piston' => 'haskell'],
            'elixir' => ['label' => 'Elixir', 'entry' => 'main.exs', 'piston' => 'elixir'],
            'clojure' => ['label' => 'Clojure', 'entry' => 'main.clj', 'piston' => 'clojure'],
            'fsharp' => ['label' => 'F#', 'entry' => 'main.fsx', 'piston' => 'fsharp'],
            'nim' => ['label' => 'Nim', 'entry' => 'main.nim', 'piston' => 'nim'],
            'zig' => ['label' => 'Zig', 'entry' => 'main.zig', 'piston' => 'zig'],
        ],
        // Web languages rendered client-side in a sandboxed iframe preview.
        'web_languages' => [
            'html' => ['label' => 'HTML', 'entry' => 'index.html'],
            'css' => ['label' => 'CSS', 'entry' => 'style.css'],
        ],
    ],

    'sentry' => [
        'dsn' => env('SENTRY_DSN', ''),
    ],

];
