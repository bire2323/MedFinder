<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\PendingUser;
use App\Models\OtpVerification;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog;
use Laravel\Socialite\Facades\Socialite; 
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Log;


class AuthController extends Controller
{
    // POST /api/login
    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'password' => 'required',
        ], [
            'phone.required' => 'phone_required',
            'name.required' => 'name_required',
        ]);
        $user = User::where('Phone', $request->phone)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User_not_found'
            ]);
        }
        if (!Hash::check($request->password, $user->Password)) {
            return response()->json([
                'ok' => false,
                'success' => false,
                "message" => "Invalid_credentials",
            ]);
        }
        Auth::login($user);
        $request->session()->regenerate();
        AuditLog::create([
            'user_id' => $user->id,
            'category' => 'user',
            'event' => 'user Registration ',
            'detail' => "{$user->Name} loged successfully",
            'ip_address' => $request->ip(),
            'metadata' => json_encode($user),
            'event_status' => 'success',
        ]);
        return response()->json([
            'success' => true,
            'user' => $user,
            'roles' => $user->getRoleNames(),
        ]);

    }

    // POST /api/register
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|min:4|max:20',
            'phone' => 'required|unique:users,phone',
            'password' => 'required',
        ], [
            'phone.required' => 'phone_required',
            'phone.unique' => 'phone_taken',
            'name.required' => 'name_required',
            'name.min' => 'name_min_4',
        ]);


        $otp = random_int(1000, 9999);
        $expiresAt = now()->addMinutes(5);

        // Save pending user
        PendingUser::updateOrCreate(
        ['phone' => $validated['phone']],
        [
            'name' => $validated['name'],
            'password' => Hash::make($validated['password']),
            'expires_at' => $expiresAt,
        ]
        );

        // Save OTP
        OtpVerification::updateOrCreate(
        ['phone' => $validated['phone']],
        [
            'otp_hash' => Hash::make($otp),
            'expires_at' => $expiresAt,
            'attempts' => 0,
        ]
        );

        // TODO: Send OTP via SMS provider
        // sendOtpSms($validated['phone'], $otp);

        return response()->json([
            'success' => true,
            'message' => $otp . " OTP sent to your phone" . $request->phone,
        ]);

    }    public function verifyOtp(Request $request)    {
        $request->validate([
            'phone' => 'required',
            'otp' => 'required|digits:4',
        ]);

        $otpRow = OtpVerification::where('phone', $request->phone)->first();
        $pendingUser = PendingUser::where('phone', $request->phone)->first();

        if (!$otpRow || !$pendingUser) {
            return response()->json(["success" => false, 'message' => 'OTP expired']);
        }

        if ($otpRow->expires_at < now()) {
            return response()->json(['success' => false, 'message' => 'OTP expired']);
        }

        if ($otpRow->attempts >= 2) {
            return response()->json(['success' => false, 'message' => 'Too many attempts']);
        }

        if (!Hash::check($request->otp, $otpRow->otp_hash)) {

            $otpRow->increment('attempts');
            return response()->json(['success' => false, 'message' => 'Invalid OTP']);
        }

        // Create real user
        $user = User::create([
            'Name' => $pendingUser->name,
            'Phone' => $pendingUser->phone,
            'Password' => $pendingUser->password,
        ]);

        $user->assignRole('patient'); // or default role
        Auth::login($user);
        $request->session()->regenerate();

        // Cleanup
        $otpRow->delete();
        $pendingUser->delete();
        AuditLog::create([
            'user_id' => $user->id,
            'category' => 'user',
            'event' => 'user Registration ',
            'detail' => "{$user->Name} registered successfully",
            'ip_address' => $request->ip(),
            'metadata' => json_encode($user),
            'event_status' => 'success',
        ]);

        return response()->json([
            'success' => true,
            'user' => $user,
            'roles' => $user->getRoleNames(),
        ]);    }
    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|exists:pending_users,phone', // better validation
        ], [
            'phone.required' => 'phone_required',
            'phone.exists' => 'no_pending_registration_found',
        ]);
        $otpRow = OtpVerification::where('phone', $request->phone)->first();
        $pendingUser = PendingUser::where('phone', $request->phone)->first();
        if ($otpRow->updated_at->diffInMinutes(now()) < 1) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait 1 minute before requesting new OTP'
            ], 429);
        }

        $otp = random_int(1000, 9999);
        $expiresAt = now()->addMinutes(5);
        // Reset failed attempts when user asks for new code
        $otpRow->update([
            'attempts' => 0,
            'otp_hash' => Hash::make($otp),
            'expires_at' => $expiresAt,
        ]);




        // TODO: Send OTP via SMS provider
        // sendOtpSms($validated['phone'], $otp);

        return response()->json([
            'success' => true,
            'message' => $otp . " OTP sent to your phone",
        ]);

    }
    // POST /api/logout (protected)
    public function logout(Request $request)    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ], 200);    }

    // GET /api/user (protected)
    public function user(Request $request)
    {
    //    Log::info('API USER SESSION', [
    //'session_id' => session()->getId(),
   // 'auth_check' => Auth::check()
//  ]);
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if (!$user) {
       
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
            'roles' => $user->getRoleNames(),
        ]);
    }

    public function updateProfile(Request $request)
    {

        $user = $request->user();
        if (!$user) {
            return response()->json(["success" => false, "message" => "Unauthenticated"]);
        }
        $validated = $request->validate([
            'name' => 'required|string|min:4|max:20',
            'phone' => 'unique:users,phone,' . $user->id,
            'email' => 'email|unique:users,email,' . $user->id,
        ]);
        $data = [
            'Name' => $validated['name'],
            'Phone' => $validated['phone'] ?? null,
            'Email' => $validated['email'] ?? null,        ];
        $user->update(array_filter($data, fn($v) => !is_null($v)));

        return response()->json(["success" => true, "message" => "Profile updated successfully"]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(["success" => false, "message" => "Unauthenticated"]);
        }
        $validated = $request->validate([
            'currentPassword' => 'required',
            'newPassword' => 'required|min:6|confirmed',
        ]);
        if (!Hash::check($validated['currentPassword'], $user->Password)) {
            return response()->json(["success" => false, "message" => "Invalid old password"]);
        }
        $user->Password = Hash::make($validated['newPassword']);
        $user->save();
        return response()->json(["success" => true, "message" => "Password updated successfully"]);
    }


   public function redirectToGoogle()
{
    // Set the redirect URL dynamically for local development
    $redirectUrl = env('GOOGLE_REDIRECT_URL');  

    return Socialite::driver('google')
        ->redirectUrl($redirectUrl)   // ← This is the most important line
        ->stateless()                 // Keep this if you're using API/SPA
        ->redirect();
}

public function handleGoogleCallback()
{
    $redirectUrl = env('GOOGLE_REDIRECT_URL');

    // Apply the same redirectUrl in callback too (very important!)
    $googleUser = Socialite::driver('google')
        ->redirectUrl($redirectUrl)
        ->stateless()
        ->user();

    // Rest of your code remains the same...
    $user = User::firstOrCreate(
        ['Email' => $googleUser->getEmail()],
        [
            'Name'   => $googleUser->getName(),
            'Password' => bcrypt(Str::random(16)),
           
        ]
    );
    $user->refresh();

    if (!$user->hasAnyRole() && $user->roles()->count() === 0) {
        Log::info("assign role");
        $user->assignRole('patient');
        // your audit log...
    }else {
    Log::info("User already has role(s)", [
        'user_id' => $user->id,
        'email'   => $user->Email,
        'roles'   => $user->getRoleNames()->toArray()
    ]);
}
// Important fixes for Socialite + Sanctum
    Auth::guard('web')->login($user);     // Explicitly use web guard
    session()->regenerate(true);
  Log::info('Google login - session created', [
        'user_id' => $user->id,
        'email'   => $user->Email,
        'session_id' => session()->getId()
    ]);

    return redirect(env('FRONTEND_URL') . '/auth/callback');
}
}
