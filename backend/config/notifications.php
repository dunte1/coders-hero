<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Channels
    |--------------------------------------------------------------------------
    | Controls which delivery channels are enabled across the whole system.
    | A channel that is disabled here can never be used, regardless of user
    | preferences or template configuration.
    */
    'channels' => [
        'in_app' => env('NOTIFICATION_CHANNEL_IN_APP', true),
        'email' => env('NOTIFICATION_CHANNEL_EMAIL', true),
        'sms' => env('NOTIFICATION_CHANNEL_SMS', false),
        'push' => env('NOTIFICATION_CHANNEL_PUSH', false),
        'whatsapp' => env('NOTIFICATION_CHANNEL_WHATSAPP', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification categories
    |--------------------------------------------------------------------------
    | Categories that drive notification preferences and templates. Each user
    | can toggle email / sms / push / in_app per category.
    */
    'categories' => [
        'attendance' => 'Attendance Alerts',
        'fees' => 'Fee Reminders',
        'assignments' => 'Assignment Notifications',
        'exams' => 'Exam Notifications',
        'competitions' => 'Competition Notifications',
        'certificates' => 'Certificate Notifications',
        'admissions' => 'Admission Notifications',
        'system' => 'System Notifications',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default preferences
    |--------------------------------------------------------------------------
    | Used when a user has not explicitly configured preferences for a category.
    */
    'default_preferences' => [
        'email' => true,
        'sms' => false,
        'push' => true,
        'in_app' => true,
        'whatsapp' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Retry handling
    |--------------------------------------------------------------------------
    | max_attempts is the total number of delivery attempts per notification
    | delivery (including the first). backoff is the base delay in seconds
    | between attempts; each retry multiplies the delay by retry_multiplier.
    */
    'retry' => [
        'max_attempts' => (int) env('NOTIFICATION_MAX_ATTEMPTS', 3),
        'backoff' => (int) env('NOTIFICATION_BACKOFF_SECONDS', 60),
        'backoff_multiplier' => 2,
    ],

    /*
    |--------------------------------------------------------------------------
    | Africa's Talking (SMS)
    |--------------------------------------------------------------------------
    | https://africastalking.com. Username defaults to "sandbox" in the
    | Africa's Talking sandbox environment.
    */
    'africastalking' => [
        'username' => env('AT_USERNAME', 'sandbox'),
        'api_key' => env('AT_API_KEY'),
        'from' => env('AT_SMS_FROM', 'CHHERO'),
        'endpoint' => env('AT_ENDPOINT', 'https://api.africastalking.com/version1/messaging'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Firebase Cloud Messaging (Push)
    |--------------------------------------------------------------------------
    | Two options are supported:
    |  - legacy server key: FCM_SERVER_KEY (http v1 / legacy compatible)
    |  - service account JSON: FCM_CREDENTIALS_FILE (path to the JSON file)
    | project_id is required for the HTTP v1 API.
    */
    'fcm' => [
        'enabled' => (bool) env('FCM_ENABLED', false),
        'server_key' => env('FCM_SERVER_KEY'),
        'credentials_file' => env('FCM_CREDENTIALS_FILE'),
        'project_id' => env('FCM_PROJECT_ID'),
        'endpoint' => env('FCM_ENDPOINT', 'https://fcm.googleapis.com/v1/projects/%s/messages:send'),
    ],
];
