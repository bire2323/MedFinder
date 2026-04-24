<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Hospital;
use App\Models\Pharmacy;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    /**
     * Get aggregate platform statistics.
     */
    public function stats()
    {
        $totalUsers = User::count();
        $totalHospitals = Hospital::where('status', 'APPROVED')->count();
        $totalPharmacies = Pharmacy::where('status', 'APPROVED')->count();
        $pendingHospitals = Hospital::where('status', 'PENDING')->count();
        $pendingPharmacies = Pharmacy::where('status', 'PENDING')->count();
        return response()->json([
            'success' => true,
            'total_users' => $totalUsers,
            'total_hospitals' => $totalHospitals,
            'total_pharmacies' => $totalPharmacies,
            'pending_approvals' => $pendingHospitals + $pendingPharmacies,
        ]);
    }

    /**
     * List all platform users.
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where('Name', 'like', '%' . $request->search . '%')
                  ->orWhere('Phone', 'like', '%' . $request->search . '%');
        }

        $users = $query->latest()->paginate(10);
        foreach ($users as $user)
            $user->role = $user->getRoleNames();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }
    public function index(){

    $users = User::paginate(10); 
    foreach ($users as $user)
            $user->role = $user->getRoleNames();

    return response()->json(['success' => true,
            'data' => $users,]);
    }

    /**
     * Update user details or roles.
     */
    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'Name' => 'sometimes|string|max:255',
            'Phone' => 'sometimes|string|unique:users,Phone,' . $user->id,
            'role' => 'sometimes|string',
            "status"=> "sometimes|string",
        ]);

        $user->update($validated);

        if ($request->has('role')) {
          //  \Log::info("stat");
            $user->syncRoles($request->role);
        }
        if ($request->has("status")) {
           // \Log::info("sta");
          $user->status = $request->status;
          $user->save();
           // \Log::info($user);
        }

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user->getRoleNames(),
        ]);
    }

    /**
     * List administrative notifications.
     */
    public function notifications()
    {
        $notifications = Notification::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markRead(Notification $notification)
    {
        $notification->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }
}
