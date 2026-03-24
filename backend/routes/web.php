<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

Route::get('/', function () {
    return view('welcome');
});

// The 'web' middleware group is REQUIRED here: it starts the session,
// decrypts cookies, and validates the CSRF token. Without it, Laravel
// has no session to verify against and will always return 419.
// 'auth:sanctum' then checks the session-based stateful authentication.
Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);