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
        $notifications = Notification::where('user_id', auth()->id())->latest()->get();

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
     * Delete old, read notifications based on a given duration.
     */
    public function deleteOldNotifications(Request $request)
    {
        $validated = $request->validate([
            'duration' => 'required|string|in:7_days,30_days,6_months,1_year',
        ]);

        $duration = $validated['duration'];
        $thresholdDate = match ($duration) {
            '7_days' => now()->subDays(7),
            '30_days' => now()->subDays(30),
            '6_months' => now()->subMonths(6),
            '1_year' => now()->subYear(),
        };

        $deletedCount = Notification::whereNotNull('read_at')
                                    ->where('created_at', '<', $thresholdDate)
                                    ->delete();

        return response()->json([
            'success' => true,
            'message' => "Successfully deleted {$deletedCount} old notifications.",
            'deleted_count' => $deletedCount,
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
                            ->orWhere('email', 'LIKE', "%{$search}%")
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

        // User Activity Trends based on audit log entries by user role
        $activityRows = DB::table('audit_log')
            ->join('users', 'audit_log.user_id', '=', 'users.id')
            ->join('model_has_roles', function ($join) {
                $join->on('model_has_roles.model_id', '=', 'users.id')
                     ->where('model_has_roles.model_type', '=', User::class);
            })
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('audit_log.created_at', '>=', $startDate)
            ->selectRaw("DATE(audit_log.created_at) as date, roles.name as role, COUNT(*) as total")
            ->groupBy('date', 'role')
            ->get()
            ->groupBy('date');

        $userActivity = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $dayName = now()->subDays($i)->format('D');
            $group = $activityRows->get($date, collect());

            $counts = collect($group)
                ->mapWithKeys(function ($item) {
                    return [strtolower($item->role) => (int) $item->total];
                });

            $userActivity[] = [
                'date' => $dayName,
                'patients' => $counts->get('patient', 0),
                'hospitalAgents' => $counts->get('hospital', 0),
                'pharmacyAgents' => $counts->get('pharmacy', 0),
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

        // Top audit categories or service-like activity categories
        $topServices = AuditLog::selectRaw('COALESCE(category, "Uncategorized") as name, COUNT(*) as requests')
            ->where('created_at', '>=', $startDate)
            ->groupBy('name')
            ->orderByDesc('requests')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'requests' => (int) $item->requests,
                ];
            });

        $totalMessages = ChatMessage::where('created_at', '>=', $startDate)->count();

        $previousStart = now()->subDays($days * 2);
        $previousEnd = now()->subDays($days + 1);

        $currentUserSignups = User::whereBetween('created_at', [$startDate, now()])->count();
        $previousUserSignups = User::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $currentHospitalApprovals = Hospital::where('status', 'APPROVED')
            ->whereBetween('created_at', [$startDate, now()])
            ->count();
        $previousHospitalApprovals = Hospital::where('status', 'APPROVED')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $currentPharmacyApprovals = Pharmacy::where('status', 'APPROVED')
            ->whereBetween('created_at', [$startDate, now()])
            ->count();
        $previousPharmacyApprovals = Pharmacy::where('status', 'APPROVED')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $previousChatCount = ChatMessage::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $peakHour = $chatInteractions->sortByDesc('interactions')->first()?->hour ?? '12:00';
        $avgResponseTime = 2.3; // Placeholder, as response time calculation is complex
        $userSatisfaction = 94.5; // Placeholder, no feedback system yet

        return response()->json([
            'success' => true,
            'overview' => [
                'totalUsers' => User::count(),
                'activeHospitals' => Hospital::where('status', 'APPROVED')->count(),
                'activePharmacies' => Pharmacy::where('status', 'APPROVED')->count(),
                'totalChats' => $totalMessages,
                'userGrowth' => $this->percentageChange($previousUserSignups, $currentUserSignups),
                'hospitalGrowth' => $this->percentageChange($previousHospitalApprovals, $currentHospitalApprovals),
                'pharmacyGrowth' => $this->percentageChange($previousPharmacyApprovals, $currentPharmacyApprovals),
                'chatGrowth' => $this->percentageChange($previousChatCount, $totalMessages),
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

    private function percentageChange(int $previous, int $current): float
    {
        if ($previous === 0) {
            return $current === 0 ? 0.0 : 100.0;
        }

        return round((($current - $previous) / max($previous, 1)) * 100, 1);
    }

    /**
     * Clear audit logs older than a given period.
     */
    public function clearOldAuditLogs(Request $request)
    {
        // 1. Ensure only admins can access this endpoint
        if (!$request->user() || !$request->user()->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only administrators can perform this action.'
            ], 403);
        }

        // 2. Validate the retention period input
        $validated = $request->validate([
            'period' => 'required|string|in:1_month,6_months,1_year',
        ]);

        $period = $validated['period'];

        // 3. Calculate threshold date using Carbon
        $thresholdDate = match ($period) {
            '1_month' => now()->subMonth(),
            '6_months' => now()->subMonths(6),
            '1_year' => now()->subYear(),
        };

        // 4. Delete matching logs using forceDelete (hard delete)
        $deletedCount = AuditLog::where('created_at', '<', $thresholdDate)->forceDelete();

        // 5. Return success JSON response
        return response()->json([
            'success' => true,
            'message' => 'Old logs deleted successfully',
            'deleted_count' => $deletedCount,
        ]);
    }
}
