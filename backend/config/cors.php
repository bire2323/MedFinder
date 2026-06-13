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

    'allowed_origins' => [
        'https://med-finder-five.vercel.app',
        'https://medfinder-nqdq.onrender.com',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [
        'https://cellulolytic-nonshredding-kena\.ngrok-free\.dev',
        'https://med-finder-five\.vercel\.app',
        'http://localhost(:[0-9]+)?',
        'http://127\.0\.0\.1(:[0-9]+)?',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
