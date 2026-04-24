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
        if (!$hospital) {
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

        if (!$department) {
            $department = Department::create($validated);
        }

        // Attach to hospital if not already attached
        if (!$hospital->departments()->where('department_id', $department->id)->exists()) {
            $hospital->departments()->attach($department->id);
        }

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
