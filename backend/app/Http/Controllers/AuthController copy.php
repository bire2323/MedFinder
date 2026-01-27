<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;


use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Exception;



class AuthController extends Controller
{

    /**
     * Login user and return API token
     */
    public function login(Request $request)
    {
        $request->validate([
            'u_email' => 'required|email',
            'password' => 'required',
        ]);


        $throttleKey = strtolower($request->u_email) . '|' . $request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            AuditLog::create([

                'category' => 'security',
                'event' => 'Invalide login ',
                'detail' => "5 consicative login trial failed",
                'ip_address' => $request->ip(),
                'metadata' => json_encode(['case' => 'login trial by unknown user', 'status' => 'blocked by rate limiter']),
                'event_status' => 'Critical',
            ]);
            return response()->json([
                'ok' => false,
                'message' => 'Too many login attempts. Try again later.'
            ], 429);
        }


        $user = User::where('u_email', $request->u_email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            AuditLog::create([

                'category' => 'security',
                'event' => 'Invalide login ',
                'detail' => "the cridential is invalide",
                'ip_address' => $request->ip(),
                'metadata' => json_encode(['case' => 'login trial by unknown user', 'status' => 'blocked by rate limiter']),
                'event_status' => 'Critical',
            ]);
            return response()->json([
                'ok' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        RateLimiter::clear($throttleKey);


        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'ok' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    }

    /**
     * Register new user and return API token
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'u_name' => 'required|string|min:6|max:30',
            'u_email' => 'required|email|unique:users,u_email',
            'password' => 'required|confirmed',
        ]);

        $user = User::create([
            'u_name' => $validated['u_name'],
            'u_email' => $validated['u_email'],
            'provider' => 'email',
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole('admin');

        $token = $user->createToken('api-token')->plainTextToken;
        AuditLog::create([
            'user_id' => $user->id,
            'category' => 'user',
            'event' => 'user Registration ',
            'detail' => "{$user->u_name} registered successfully",
            'ip_address' => $request->ip(),
            'metadata' => json_encode($user),
            'event_status' => 'success',
        ]);
        return response()->json([
            'ok' => true,
            'message' => 'Registered successfully',
            'user' => $user,
            'roles' => ['admin'],
            'token' => $token
        ]);
    }



    public function redirectToGoogle()
    {
        config([
            'services.google.client_id' => env('GOOGLE_CLIENT_ID'),
            'services.google.client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'services.google.redirect' => env('GOOGLE_REDIRECT_URL'),
        ]);
        return Socialite::driver('google')->stateless()->redirect();
    }
    public function redirectToGithub()
    {
        config([
            'services.github.client_id' => env('GITHUB_CLIENT_ID'),
            'services.github.client_secret' => env('GITHUB_CLIENT_SECRET'),
            'services.github.redirect' => env('GITHUB_REDIRECT_URL'),
        ]);
        return Socialite::driver('github')->stateless()->redirect();
    }


    public function handleGithubCallback()
    {
        config([
            'services.github.client_id' => env('GITHUB_CLIENT_ID'),
            'services.github.client_secret' => env('GITHUB_CLIENT_SECRET'),
            'services.github.redirect' => env('GITHUB_REDIRECT_URL'),
        ]);
        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('github');
        $githubUser = $provider->stateless()->user();

        $user = User::firstOrCreate(
            ['u_email' => $githubUser->getEmail()],
            [
                'u_name' => $githubUser->getName() ?? $githubUser->getNickname(),
                'password' => bcrypt(Str::random(16)),
                'provider' => 'github',
            ]
        );
        if (!$user->hasAnyRole()) {

            $user->assignRole('customer');
            AuditLog::create([
                'user_id' => $user->id,
                'category' => 'user',
                'event' => 'user signup by github account ',
                'detail' => "{$user->u_name} registered successfully",
                'metadata' => json_encode($user),
                'event_status' => 'success',
            ]);
        }
        auth::login($user);
        $token = $user->createToken('api-token')->plainTextToken;

        return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
    }

    public function handleGoogleCallback()
    {
        config([
            'services.google.client_id' => env('GOOGLE_CLIENT_ID'),
            'services.google.client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'services.google.redirect' => env('GOOGLE_REDIRECT_URL'),
        ]);
        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('google');
        $googleUser = $provider->stateless()->user();

        $user = User::firstOrCreate(
            ['u_email' => $googleUser->getEmail()],
            [
                'u_name' => $googleUser->getName(),
                'password' => bcrypt(Str::random(16)),
                'provider' => 'google',
            ]
        );
        if (!$user->hasAnyRole()) {

            $user->assignRole('admin');
            AuditLog::create([
                'user_id' => $user->id,
                'category' => 'user',
                'event' => 'user signup by github account ',
                'detail' => "{$user->u_name} registered successfully",
                'metadata' => json_encode($user),
                'event_status' => 'success',
            ]);
        }
        auth::login($user);
        $token = $user->createToken('api-token')->plainTextToken;

        return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
    }
}
