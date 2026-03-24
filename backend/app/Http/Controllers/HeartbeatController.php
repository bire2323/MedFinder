<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HeartbeatController extends Controller
{
    /**
     * Update the authenticated user's last_seen_at timestamp.
     */
    public function __invoke(Request $request)
    {
        $user = Auth::user();
        if ($user) {
            $user->update([
                'last_seen_at' => now(),
            ]);
        }

        return response()->json(['status' => 'ok']);
    }
}
