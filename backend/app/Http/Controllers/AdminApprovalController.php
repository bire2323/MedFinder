<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use App\Models\Pharmacy;
use App\Models\ApprovalLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminApprovalController extends Controller
{
    /**
     * Get all pending registrations.
     */
    public function index(Request $request)
    {
        $status = strtoupper($request->query('status', 'PENDING'));

        $hospitals = Hospital::with('addresses', 'agent')
            ->where('status', $status)
            ->get()
            ->map(function ($h) {
                $h->type = 'hospital';
                $h->entityName = $h->hospital_name_en;
                return $h;
            });

        $pharmacies = Pharmacy::with('addresses', 'agent')
            ->where('status', $status)
            ->get()
            ->map(function ($p) {
                $p->type = 'pharmacy';
                $p->entityName = $p->pharmacy_name_en;
                return $p;
            });

        return response()->json([
            'success' => true,
            'data' => $hospitals->concat($pharmacies)
        ]);
    }

    /**
     * Approve or reject a facility.
     */
    public function decide(Request $request, $id)
    {
        $request->validate([
            'decision' => 'required|in:approved,rejected',
            'reason' => 'required_if:decision,rejected|string|nullable',
            'type' => 'required|in:hospital,pharmacy', // Added type to handle both
        ]);

        $type = $request->type;
        $decision = strtoupper($request->decision);
        $reason = $request->reason;
        $adminId = auth()->id();

        DB::beginTransaction();
        try {
            if ($type === 'hospital') {
                $facility = Hospital::findOrFail($id);
            } else {
                $facility = Pharmacy::findOrFail($id);
            }

            $facility->update([
                'status' => $decision,
                'rejection_reason' => $decision === 'REJECTED' ? $reason : null,
                'approved_by' => $adminId,
            ]);

            ApprovalLog::create([
                'facility_id' => $id,
                'facility_type' => $type,
                'action' => strtolower($decision),
                'reviewed_by' => $adminId,
                'comment' => $reason,
            ]);

            // Notify Owner in real-time
            $ownerId = ($type === 'hospital') ? $facility->hospital_agent_id : $facility->pharmacy_agent_id;
            \Log::info('Owner ID for facility approve notifing:', ['id' => $ownerId]);
            $statusMessage = $decision === 'APPROVED' ? 'approved' : 'rejected';
            $title = "Registration " . ucfirst(strtolower($decision));
            $message = "Your " . ucfirst($type) . " registration has been {$statusMessage}.";
            if ($decision === 'REJECTED' && $reason) {
                $message .= " Reason: {$reason}";
            }

            $notification = \App\Models\Notification::create([
                'user_id' => $ownerId,
                'type' => strtolower($decision),
                'priority' => $decision === 'APPROVED' ? 'medium' : 'high',
                'title' => $title,
                'message' => $message,
            ]);

           broadcast(new \App\Events\NotificationSent($notification))->toOthers();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Facility has been " . strtolower($decision) . " successfully."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Action failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
