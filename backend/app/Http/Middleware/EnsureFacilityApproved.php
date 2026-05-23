<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureFacilityApproved
{
    /**
     * Handle an incoming request.
     * Block any modifying requests from hospital/pharmacy agents whose facility is not approved.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth('sanctum')->user();

        if (!$user) {
            return $next($request);
        }

        // Admins are always allowed
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Only enforce on modifying HTTP methods
        if (!in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            return $next($request);
        }

        // If user is a pharmacy agent, ensure their pharmacy is approved
        if ($user->hasRole('pharmacyAgent')) {
            $pharmacy = $user->pharmacy;
            if (!$pharmacy || strtoupper($pharmacy->status) !== 'APPROVED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your pharmacy is not yet approved by admin. Posting is disabled until approval.'
                ], 403);
            }
        }

        // If user is a hospital agent, ensure their hospital is approved
        if ($user->hasRole('hospitalAgent')) {
            $hospital = $user->hospital;
            if (!$hospital || strtoupper($hospital->status) !== 'APPROVED') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your hospital is not yet approved by admin. Posting is disabled until approval.'
                ], 403);
            }
        }

        return $next($request);
    }
}
