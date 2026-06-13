<?php

namespace App\Http\Controllers;

use App\Models\OtpVerification;
use App\Models\PendingUser;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Helpers\SmsHelper;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * POST /api/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'phone'    => 'required',
            'password' => 'required',
        ], [
            'phone.required'    => 'phone_required',
            'name.required'     => 'name_required', // unused but kept for consistency
        ]);

        $user = User::where('Phone', $request->phone)->first();

        if (!$user) {
            $this->logAudit($request, 'LOGIN', "Failed login: unknown phone {$request->phone}", 'failed', 'auth', ['phone' => $request->phone]);
            return response()->json([
                'success' => false,
                'message' => 'User_not_found'
            ]);
        }

        if (!Hash::check($request->password, $user->Password)) {
            $this->logAudit($request, 'LOGIN', "Failed login for user {$user->id}", 'failed', 'auth', ['phone' => $request->phone], $user->id);
            return response()->json([
                'success' => false,
                'message' => 'Invalid_credentials',
            ]);
        }

        // Login using web guard + session
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        $this->logAudit($request, 'LOGIN', "{$user->Name} logged in successfully", 'success', 'auth', ['phone' => $request->phone], $user->id);

        return response()->json([
            'success' => true,
            'user'    => $user,
            'roles'   => $user->getRoleNames(),
        ]);
    }

    /**
     * POST /api/register
     */

    public function register(Request $request)
{
    $validated = $request->validate([
        'name'     => 'required|string|min:4|max:20',
        'phone'    => 'required|unique:users,phone|regex:/^09\d{8}$/',
        'password' => 'required|min:6',
    ], [
        'phone.required' => 'phone_required',
        'phone.unique'   => 'phone_taken',
        'name.required'  => 'name_required',
        'name.min'       => 'name_min_4',
    ]);

    // Convert local Ethiopian format (09xxxxxxxx) to E.164 (+2519xxxxxxxx)
    $normalizedPhone = preg_replace('/^0/', '+251', $validated['phone']);

    $otp = random_int(1000, 9999);
    $expiresAt = now()->addMinutes(5);

    // Save pending user
    PendingUser::updateOrCreate(
        ['phone' => $validated['phone']], // keep original for DB consistency
        [
            'name'       => $validated['name'],
            'password'   => Hash::make($validated['password']),
            'expires_at' => $expiresAt,
        ]
    );

    // Save OTP
    OtpVerification::updateOrCreate(
        ['phone' => $validated['phone']],
        [
            'otp_hash'   => Hash::make($otp),
            'expires_at' => $expiresAt,
            'attempts'   => 0,
        ]
    );

    // Send OTP via Telerivet using normalized phone
    $res = SmsHelper::sendOtpSms($normalizedPhone, $otp);

    if (!$res) {
        $this->logAudit(
            $request,
            'REGISTER_REQUEST',
            "Failed to send OTP for phone {$validated['phone']}",
            'failed',
            'auth',
            ['phone' => $validated['phone']]
        );

        return response()->json([
            'success' => false,
            'message' => 'Failed to send OTP, please try again later'
        ], 500);
    }

    $this->logAudit(
        $request,
        'REGISTER_REQUEST',
        "OTP sent for phone {$validated['phone']}",
        'success',
        'auth',
        ['phone' => $validated['phone']]
    );

    return response()->json([
        'success' => true,
        'message' => 'OTP sent successfully'
    ]);
}


    /**
     * POST /api/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required',
            'otp'   => 'required|digits:4',
        ]);

        $otpRow = OtpVerification::where('phone', $request->phone)->first();
        $pendingUser = PendingUser::where('phone', $request->phone)->first();

        if (!$otpRow || !$pendingUser) {
            $this->logAudit($request, 'REGISTER_VERIFY', "OTP attempt failed - expired or missing record for {$request->phone}", 'failed', 'auth', ['phone' => $request->phone]);
            return response()->json(['success' => false, 'message' => 'OTP expired']);
        }

        if ($otpRow->expires_at < now()) {
            $this->logAudit($request, 'REGISTER_VERIFY', "OTP expired for phone {$request->phone}", 'failed', 'auth', ['phone' => $request->phone]);
            return response()->json(['success' => false, 'message' => 'OTP expired']);
        }

        if ($otpRow->attempts >= 2) {
            $this->logAudit($request, 'REGISTER_VERIFY', "Too many OTP attempts for phone {$request->phone}", 'failed', 'auth', ['phone' => $request->phone]);
            return response()->json(['success' => false, 'message' => 'Too many attempts']);
        }

        if (!Hash::check($request->otp, $otpRow->otp_hash)) {
            $otpRow->increment('attempts');
            $this->logAudit($request, 'REGISTER_VERIFY', "Invalid OTP for phone {$request->phone}", 'failed', 'auth', ['phone' => $request->phone]);
            return response()->json(['success' => false, 'message' => 'Invalid OTP']);
        }

        // Create real user
        $user = User::create([
            'Name'     => $pendingUser->name,
            'Phone'    => $pendingUser->phone,
            'Password' => $pendingUser->password,
        ]);

        $user->assignRole('patient');

        // Login user
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        // Cleanup
        $otpRow->delete();
        $pendingUser->delete();

        $this->logAudit($request, 'REGISTER_COMPLETE', "{$user->Name} registered successfully", 'success', 'auth', ['user_id' => $user->id], $user->id);

        return response()->json([
            'success' => true,
            'user'    => $user,
            'roles'   => $user->getRoleNames(),
        ]);
    }

    /**
     * POST /api/resend-otp
     */
    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|exists:pending_users,phone',
        ], [
            'phone.required' => 'phone_required',
            'phone.exists'   => 'no_pending_registration_found',
        ]);

        $otpRow = OtpVerification::where('phone', $request->phone)->first();

        if ($otpRow && $otpRow->updated_at->diffInMinutes(now()) < 1) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait 1 minute before requesting new OTP'
            ], 429);
        }

        $otp = random_int(1000, 9999);
        $expiresAt = now()->addMinutes(5);

        $otpRow->update([
            'attempts'   => 0,
            'otp_hash'   => Hash::make($otp),
            'expires_at' => $expiresAt,
        ]);

        // TODO: Send real OTP

        return response()->json([
            'success' => true,
            'message' => $otp . " OTP sent to your phone",
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $user = Auth::guard('web')->user();

        if ($user) {
            $this->logAudit($request, 'LOGOUT', "{$user->Name} logged out", 'success', 'auth', ['user_id' => $user->id], $user->id);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * GET /api/user
     */
    public function user(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'success' => true,
            'user'    => $user,
            'roles'   => $user->getRoleNames(),
        ]);
    }

    // Profile & Password methods (kept mostly as-is, minor cleanup)
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(["success" => false, "message" => "Unauthenticated"]);
        }

        $validated = $request->validate([
            'name'  => 'required|string|min:4|max:20',
            'phone' => 'unique:users,phone,' . $user->id,
            'Email' => 'email|unique:users,Email,' . $user->id,
        ]);

        $data = [
            'Name'  => $validated['name'],
            'Phone' => $validated['phone'] ?? null,
            'email' => $validated['Email'] ?? null,
        ];

        $user->update(array_filter($data, fn($v) => !is_null($v)));

        $this->logAudit($request, 'PROFILE_UPDATE', "{$user->Name} updated profile", 'success', 'auth', ['user_id' => $user->id], $user->id);

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
            'newPassword'     => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($validated['currentPassword'], $user->Password)) {
            $this->logAudit($request, 'PASSWORD_CHANGE', "Failed password change for {$user->Name}", 'failed', 'auth', ['user_id' => $user->id], $user->id);
            return response()->json(["success" => false, "message" => "Invalid old password"]);
        }

        $user->Password = Hash::make($validated['newPassword']);
        $user->save();

        $this->logAudit($request, 'PASSWORD_CHANGE', "{$user->Name} changed password", 'success', 'auth', ['user_id' => $user->id], $user->id);

        return response()->json(["success" => true, "message" => "Password updated successfully"]);
    }

    // ====================== Google OAuth ======================

    public function redirectToGoogle()
    {
        $redirectUrl = env('GOOGLE_REDIRECT_URL');

        return Socialite::driver('google')
            ->redirectUrl($redirectUrl)
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        $redirectUrl = env('GOOGLE_REDIRECT_URL');

        $googleUser = Socialite::driver('google')
            ->redirectUrl($redirectUrl)
            ->stateless()
            ->user();

        $user = User::firstOrCreate(
            ['email' => $googleUser->getemail()],
            [
                'Name'     => $googleUser->getName(),
                'Password' => bcrypt(Str::random(16)),
            ]
        );

        $user->refresh();

        if (!$user->hasAnyRole() && $user->roles()->count() === 0) {
            $user->assignRole('patient');
        }

        Auth::guard('web')->login($user);
        session()->regenerate();

        $this->logAudit(request(), 'LOGIN', "{$user->Name} signed in with Google", 'success', 'auth', ['provider' => 'google'], $user->id);

        return redirect(env('FRONTEND_URL') . '/auth/callback');
    }
}
