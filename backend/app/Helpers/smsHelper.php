<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsHelper
{
    public static function sendOtpSms($phone, $otp)
    {
        try {
            $response = Http::withBasicAuth(env('TELERIVET_API_KEY'), '') // <-- put before post()
                ->post('https://api.telerivet.com/v1/projects/' . env('TELERIVET_PROJECT_ID') . '/messages/send', [
                    'phone_number' => $phone,
                    'content'      => "Your verification code is: {$otp}",
                    // 'route_id'     => 'YOUR_ROUTE_ID', // optional
                ]);

            if ($response->failed()) {
                Log::error("Telerivet SMS failed", [
                    'phone'    => $phone,
                    'otp'      => $otp,
                    'response' => $response->body()
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error("Telerivet SMS exception", [
                'phone' => $phone,
                'otp'   => $otp,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}


