<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Add your React frontend origin here
    'allowed_origins' => ['http://localhost:5173'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // token auth does NOT need cookies
];