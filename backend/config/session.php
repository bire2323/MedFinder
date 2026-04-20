<?php

use Illuminate\Support\Str;

return [
    'driver' => env('SESSION_DRIVER', 'cookie'),
    'lifetime' => (int) env('SESSION_LIFETIME', 120),
    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),
    'encrypt' => env('SESSION_ENCRYPT', false),
    'files' => storage_path('framework/sessions'),
    'connection' => env('SESSION_CONNECTION'),
    'table' => env('SESSION_TABLE', 'sessions'),
    'store' => env('SESSION_STORE'),
    'lottery' => [2, 100],
    
    // CRITICAL: Use environment variable with explicit default
    'cookie' => env('SESSION_COOKIE', 'laravel_session'), // Changed from dynamic slug
    
    'path' => env('SESSION_PATH', '/'),
    'domain' => env('SESSION_DOMAIN', '.medfinder.com'),
    'secure' => env('SESSION_SECURE_COOKIE', true),
    'http_only' => env('SESSION_HTTP_ONLY', true),
    'same_site' => env('SESSION_SAME_SITE', 'none'),
    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),
];