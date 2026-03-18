<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\PendingUser;
use App\Models\OtpVerification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class UserController extends Controller{


public function forgotPassword(Request $request){
     $request->validate([
        "phone"=>"required"
     ],[
        "phone.required"=>"phone_required",
     ]);



     //check if user exists
     $user=User::where("Phone",$request->phone)->first();

     if (!$user) {
         return response()->json(['success'=>false, 'message' => 'User_not_found'], 404);
     }

     // Generate and send OTP
      $otp = rand(1000, 9999);
      $expiresAt = now()->addMinutes(5);
       // Save pending user
  

    // Save OTP
    OtpVerification::updateOrCreate(
        ['phone' => $request->phone],
        [
            'otp_hash' => Hash::make($otp),
            'expires_at' => $expiresAt,
            'attempts' => 0,
        ]
    );


     // Send OTP via SMS or email (implementation depends on your setup)

     return response()->json(['success'=>true, 'message' => $otp.'OTP sent successfully to- '.$request->phone]);
}

public function resetPassword(Request $request){
    $request->validate([
        "phone"=>"required",
        "token"=>"required",
        "new_password"=>"required|min:6"
    ],[
        "phone.required"=>"Phone_is_required",
        "new_password.required"=>"New_Password_is_Required"
    ]);
    //find user
    $user=User::where("Phone",$request->phone)->first();
    $pendingUser = PendingUser::where("phone",$request->phone)->first();

    $otpRow = OtpVerification::where('phone', $request->phone)->first();
   
    if (!$user) {
        return response()->json(['success'=>false, 'message' => 'User_not_found'], 404);
    }
    if($pendingUser->expires_at < now()){
        return response()->json(["success"=>false,"message"=>"token_expired"]);
    }

    if (!Hash::check($request->token,$pendingUser->reset_token)){
        return response()->json(["success"=>false,"message"=>"invalid_token"]);
    }
   

   
    $user->update(['Password' => bcrypt($request->new_password)]);
    $otpRow->delete();

 return response()->json([
        'success' => true,
        'token' => $pendingUser->reset_token,
        'user' => $user,
        'roles'=>$user->getRoleNames(),
    ]);

}
public function verifyUserResttingPasswordOtp(Request $request)
{
    $request->validate([
        'phone' => 'required',
        'otp' => 'required|digits:4',
    ],[
        "phone.required"=>"phone_required",
        "otp.required"=>"otp_required",
        "otp.digits"=>"otp_digits_4"
    ]);

    $otpRow = OtpVerification::where('phone', $request->phone)->first();
    $pendingUser = PendingUser::where("phone",$request->phone)->first();
    $user = User::where("Phone",$request->phone)->first();
 

    if (!$otpRow) {
        return response()->json(["success" => false, 'message' => 'OTP expired']);
    }

    if ($otpRow->expires_at < now()) {
        return response()->json(['success' => false, 'message' => 'OTP expired']);
    }

    if ($otpRow->attempts >= 2) {
        return response()->json(['success' => false,'message' => 'Too many attempts']);
    }

   if (!Hash::check($request->otp, $otpRow->otp_hash)) {

        $otpRow->increment('attempts');
        return response()->json(['success' => false,'message' => 'Invalid OTP']);
    }

    // Create real user
    /*
    $user = User::create([
        'Name' => $pendingUser->name,
        'Phone' => $pendingUser->phone,
        'Password' => $pendingUser->password,
    ]);

    $user->assignRole('admin'); // or default role

    // Cleanup
    $otpRow->delete();
    $pendingUser->delete();
    */
 


$token = Str::random(64);

 PendingUser::updateOrCreate(
    ['phone' => $user->Phone],
    [
        
        'reset_token' => Hash::make($token),
        'created_at' => now(),
        'expires_at' => now()->addMinutes(10),
    ]
);

    return response()->json([
        'success' => true,
        'token' => $token,
         "phone"=>$user->Phone
    ]);
    }
  

       public function auditLogs(Request $request)
      {
          /** @var \App\Models\User $user */
          $user = auth('sanctum')->user();
          if(!$user){
              return response()->json(['success'=>false,'message'=>'unauthorized']);
          }
          if ($user->hasRole('admin')) {
              $query = AuditLog::query();
    
              if ($request->search) {
                  $query->where(function ($q) use ($request) {
                      $q->where('event', 'like', "%{$request->search}%")
                          ->orWhere('detail', 'like', "%{$request->search}%")
                          ->orWhere('event_status', 'like', "%{$request->search}%");
                  });
              }
              if ($request->start_date && $request->end_date) {
                  $query->whereBetween('created_at', [
                      $request->start_date . " 00:00:00",
                      $request->end_date . " 23:59:59"
                  ]);
              } else if ($request->start_date) {
                  $query->whereDate('created_at', '>=', $request->start_date);
              } else if ($request->end_date) {
                  $query->whereDate('created_at', '<=', $request->end_date);
              }
              if ($request->category && $request->category !== 'ALL') {
                  $query->where('category', $request->category);
              }
    
              $auditLogs = $query->orderBy('id', 'desc')->paginate(10);
              return response()->json(['ok' => true, 'data' => $auditLogs]);
          }
    
          return response()->json(['ok' => false, 'message' => 'Unauthorized'], 403);
      }

public function detectIntent(Request $request){
$request->validate([
    'question' => 'required|string'
],[
    "question.required"=>"question_required",
    "question.string"=>"question_must_be_string"
]);
$response = Http::post('http://127.0.0.1:5001/detect-intent', [
    'question' => $request->question
]);

$intent = $response->json();
return response()->json([
    'success' => true,
    'intent' => $intent,
    'entities' => $intent['entities'] ?? null,
]);
}
    }



