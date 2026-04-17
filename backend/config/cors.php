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
    'allowed_origins' =>  env('APP_ENV') === 'local' ? ['http://medfinder.com'] : [
    'http://mefinder.com'
],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // required for Sanctum SPA cookie auth
];