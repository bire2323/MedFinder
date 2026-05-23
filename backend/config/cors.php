<?php

return [
      'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'api/broadcasting/auth',
        'broadcasting/auth',
        'login',
        'logout',
        'register',
    ],

    'allowed_methods' => ['*'],

    // Add your React frontend origin here
    'allowed_origins' => [
        'https://medfinder.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    'allowed_origins_patterns' => ['.*ngrok.*', 'http://localhost(:[0-9]+)?', 'http://127\.0\.0\.1(:[0-9]+)?'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // required for Sanctum SPA cookie auth
];
