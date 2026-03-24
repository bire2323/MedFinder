<?php

return [
      'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'broadcasting/auth',
        'login',
        'logout',
        'register',
    ],

    'allowed_methods' => ['*'],

    // Add your React frontend origin here
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // required for Sanctum SPA cookie auth
];