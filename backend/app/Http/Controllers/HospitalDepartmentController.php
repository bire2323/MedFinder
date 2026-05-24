<?php

namespace App\Http\Controllers;

use App\Models\HospitalDepartment;
use App\Models\Hospital;
use Illuminate\Http\Request;

class HospitalDepartmentController extends Controller
{
    private function getHospital()
    {
        $user = auth('sanctum')->user();
        if (!$user) return null;
        return Hospital::where('hospital_agent_id', $user->id)->first();
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $hospital = $this->getHospital();
        if (!$hospital) {
            return response()->json([]);
        }

        $items = HospitalDepartment::with('department')
            ->where('hospital_id', $hospital->id)
            ->get();

        return response()->json(['success' => true, 'data' => $items]);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $hospital = $this->getHospital();
        if (!$hospital) {
            $this->logAudit($request, 'DEPARTMENT_ATTACH', 'Department attach failed: hospital not found for agent', 'failed', 'department', [], auth('sanctum')->id());
            return response()->json(['success' => false, 'message' => 'Hospital not found for this agent'], 404);
        }

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
        ]);

        $item = HospitalDepartment::firstOrCreate([
            'hospital_id' => $hospital->id,
            'department_id' => $validated['department_id'],
        ]);

        $this->logAudit($request, 'DEPARTMENT_ATTACH', 'Department attached to hospital', 'success', 'department', [
            'hospital_id' => $hospital->id,
            'department_id' => (int) $validated['department_id'],
            'hospital_department_id' => $item->id,
        ], auth('sanctum')->id());

        return response()->json(['success' => true, 'data' => $item->load('department')], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(HospitalDepartment $hospitalDepartment)
    {
        return response()->json(['success' => true, 'data' => $hospitalDepartment->load(['hospital', 'department'])]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HospitalDepartment $hospitalDepartment)
    {
        $hospital = $this->getHospital();
        if ($hospital && $hospitalDepartment->hospital_id !== $hospital->id) {
            $this->logAudit($request, 'DEPARTMENT_UPDATE', 'Department update rejected: not owned by agent hospital', 'failed', 'department', [
                'hospital_department_id' => $hospitalDepartment->id,
                'hospital_id' => $hospitalDepartment->hospital_id,
            ], auth('sanctum')->id());
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
        ]);

        $hospitalDepartment->update([
            'department_id' => $validated['department_id'],
        ]);

        $this->logAudit($request, 'DEPARTMENT_UPDATE', 'Hospital department updated', 'success', 'department', [
            'hospital_department_id' => $hospitalDepartment->id,
            'hospital_id' => $hospitalDepartment->hospital_id,
            'department_id' => (int) $validated['department_id'],
        ], auth('sanctum')->id());

        return response()->json(['success' => true, 'data' => $hospitalDepartment->fresh()->load('department')]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HospitalDepartment $hospitalDepartment)
    {
        $hospital = $this->getHospital();
        if ($hospital && $hospitalDepartment->hospital_id !== $hospital->id) {
            $this->logAudit(request(), 'DEPARTMENT_DETACH', 'Department detach rejected: not owned by agent hospital', 'failed', 'department', [
                'hospital_department_id' => $hospitalDepartment->id,
                'hospital_id' => $hospitalDepartment->hospital_id,
            ], auth('sanctum')->id());
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $hospitalDepartment->delete();

        $this->logAudit(request(), 'DEPARTMENT_DETACH', 'Department detached from hospital', 'success', 'department', [
            'hospital_department_id' => $hospitalDepartment->id,
            'hospital_id' => $hospitalDepartment->hospital_id,
            'department_id' => $hospitalDepartment->department_id,
        ], auth('sanctum')->id());

        return response()->json(['success' => true]);
    }
}
