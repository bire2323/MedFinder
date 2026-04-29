<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Hospital;
use App\Models\Pharmacy;
use App\Models\Notification;
use App\Models\ChatMessage;
use App\Models\Department;
use App\Models\AuditLog;
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

    /**
     * List audit logs for admin.
     */
    public function auditLogs(Request $request)
    {
        $query = AuditLog::with(['user']);

        if ($category = $request->query('category')) {
            if (strtoupper($category) !== 'ALL') {
                $query->whereRaw('LOWER(category) = ?', [strtolower($category)]);
            }
        }

        if ($event = $request->query('event')) {
            $query->whereRaw('LOWER(event) LIKE ?', ['%' . strtolower($event) . '%']);
        }

        if ($status = $request->query('event_status')) {
            if (strtoupper($status) !== 'ALL') {
                $query->whereRaw('LOWER(event_status) = ?', [strtolower($status)]);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('detail', 'LIKE', "%{$search}%")
                    ->orWhere('ip_address', 'LIKE', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('Name', 'LIKE', "%{$search}%")
                            ->orWhere('Email', 'LIKE', "%{$search}%")
                            ->orWhere('Phone', 'LIKE', "%{$search}%");
                    });
            });
        }

        if ($startDate = $request->query('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate = $request->query('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'prev_page_url' => $logs->previousPageUrl(),
                'next_page_url' => $logs->nextPageUrl(),
            ],
        ]);
    }

    /**
     * Get analytics data for dashboard.
     */
    public function analytics(Request $request)
    {
        $range = $request->query('range', '7d');
        $days = match($range) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };

        $startDate = now()->subDays($days);

        // User Activity Trends
        $userActivity = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $dayName = now()->subDays($i)->format('D');

            $patients = User::whereHas('roles', function ($q) {
                $q->where('name', 'patient');
            })->whereDate('last_seen_at', $date)->count();

            $hospitalAgents = User::whereHas('roles', function ($q) {
                $q->where('name', 'hospital');
            })->whereDate('last_seen_at', $date)->count();

            $pharmacyAgents = User::whereHas('roles', function ($q) {
                $q->where('name', 'pharmacy');
            })->whereDate('last_seen_at', $date)->count();

            $userActivity[] = [
                'date' => $dayName,
                'patients' => $patients,
                'hospitalAgents' => $hospitalAgents,
                'pharmacyAgents' => $pharmacyAgents,
            ];
        }

        // Chatbot Interactions by Hour
        $chatInteractions = DB::table('chat_messages')
            ->selectRaw("HOUR(created_at) as hour, COUNT(*) as interactions")
            ->where('created_at', '>=', $startDate)
            ->groupByRaw("HOUR(created_at)")
            ->orderByRaw("HOUR(created_at)")
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => sprintf('%02d:00', $item->hour),
                    'interactions' => (int) $item->interactions,
                ];
            });

        // Top Services (based on departments)
        $topServices = DB::table('hospital_departments')
            ->selectRaw("departments.department_name_en as name, COUNT(*) as requests")
            ->join('departments', 'hospital_departments.department_id', '=', 'departments.id')
            ->groupBy('departments.id', 'departments.department_name_en')
            ->orderByDesc('requests')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'requests' => (int) $item->requests,
                ];
            });

        // Insights
        $peakHour = $chatInteractions->sortByDesc('interactions')->first()['hour'] ?? '12:00';
        $totalMessages = ChatMessage::where('created_at', '>=', $startDate)->count();
        $avgResponseTime = 2.3; // Placeholder, as response time calculation is complex
        $userSatisfaction = 94.5; // Placeholder, no feedback system yet

        return response()->json([
            'success' => true,
            'overview' => [
                'totalUsers' => User::count(),
                'activeHospitals' => Hospital::where('status', 'APPROVED')->count(),
                'activePharmacies' => Pharmacy::where('status', 'APPROVED')->count(),
                'totalChats' => $totalMessages,
            ],
            'userActivity' => $userActivity,
            'chatbotInteractions' => $chatInteractions,
            'topServices' => $topServices,
            'insights' => [
                'peakHour' => $peakHour,
                'avgResponseTime' => $avgResponseTime,
                'userSatisfaction' => $userSatisfaction,
            ],
        ]);
    }
}
