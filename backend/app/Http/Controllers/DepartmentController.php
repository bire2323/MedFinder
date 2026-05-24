<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Hospital;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    private function getHospital()
    {
        $user = auth('sanctum')->user();
        if (!$user) return null;
        \Log::info("Fetching hospital for user : {$user}");
        return Hospital::where('hospital_agent_id', $user->id)->first();
    }

    /**
     * Display a listing of the resource for the agent's hospital.
     */
    public function index()
    {
        $hospital = $this->getHospital();
        if (!$hospital) {
            return response()->json([]);
        }
        return response()->json($hospital->departments);
    }

    /**
     * Store a newly created resource in storage and attach to hospital.
     */
    public function store(Request $request)
    {
        $hospital = $this->getHospital();
        \Log::info("Storing department for hospital : {$hospital}");
        if (!$hospital) {
            $this->logAudit($request, 'DEPARTMENT_ATTACH', 'Department attach failed: hospital not found for agent', 'failed', 'department', [], auth('sanctum')->id());
            return response()->json(['message' => 'Hospital not found for this agent'], 404);
        }

        $validated = $request->validate([
            'department_name_en' => 'required|string|max:255',
            'department_name_am' => 'required|string|max:255',
            'department_category_name_en' => 'nullable|string|max:255',
            'department_category_name_am' => 'nullable|string|max:255',
        ]);

        // Check if department already exists globally
        $department = Department::where('department_name_en', $validated['department_name_en'])->first();
        $createdNew = false;

        if (!$department) {
            $department = Department::create($validated);
            $createdNew = true;
        }

        // Attach to hospital if not already attached
        if (!$hospital->departments()->where('department_id', $department->id)->exists()) {
            $hospital->departments()->attach($department->id);
        }

        $this->logAudit($request, 'DEPARTMENT_ATTACH', 'Department attached to hospital', 'success', 'department', [
            'hospital_id' => $hospital->id,
            'department_id' => $department->id,
            'created_new_department' => $createdNew,
        ], auth('sanctum')->id());

        return response()->json($department, 201);
    }

    /**
     * Update the specified resource.
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'department_name_en' => 'required|string|max:255',
            'department_name_am' => 'required|string|max:255',
            'department_category_name_en' => 'nullable|string|max:255',
            'department_category_name_am' => 'nullable|string|max:255',
        ]);

        $department->update($validated);

        $this->logAudit($request, 'DEPARTMENT_UPDATE', 'Department updated', 'success', 'department', [
            'department_id' => $department->id,
            'updated_fields' => array_keys($validated ?? []),
        ], auth('sanctum')->id());

        return response()->json($department);
    }

    /**
     * Remove the specified resource from hospital (detach).
     */
    public function destroy(Department $department)
    {
        $hospital = $this->getHospital();
        if ($hospital) {
            $hospital->departments()->detach($department->id);
        }

        $this->logAudit(request(), 'DEPARTMENT_DETACH', 'Department detached from hospital', 'success', 'department', [
            'hospital_id' => $hospital?->id,
            'department_id' => $department->id,
        ], auth('sanctum')->id());

        return response()->json(['success' => true]);
    }

    /**
     * Search departments.
     */
    public function search(Request $request)
    {
        $query = $request->query('q');
        $departments = Department::where('department_name_en', 'LIKE', "%{$query}%")
            ->orWhere('department_name_am', 'LIKE', "%{$query}%")
            ->get();

        return response()->json($departments);
    }
}
