<?php

namespace App\Http\Controllers;

use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Admin Region Controller
 * Path: app/Http/Controllers/Admin/RegionController.php
 */
class AdminRegionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of regions with pagination and search.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 15);

        $query = Region::query();

        if ($search) {
            $query->search($search);
        }

        $regions = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $regions->items(),
            'pagination' => [
                'total' => $regions->total(),
                'per_page' => $regions->perPage(),
                'current_page' => $regions->currentPage(),
                'last_page' => $regions->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created region.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_en' => 'required',
            'name_am' =>'required',
            'code' => 'nullable|string|max:10',
            'is_active' => 'sometimes|boolean',
        ]);
       $region = Region::withTrashed()->where('name_en', $validated['name_en'] )->orWhere('name_am', $validated['name_am'])->first();
        if ($region && $region->trashed()) {
           $region->restore();
        }
        else {

            $region = Region::create($validated);
        }

        return response()->json([
            'success' => true,
            'message' => 'Region created successfully',
            'data' => $region,
        ], 201);
    }

    /**
     * Display the specified region.
     */
    public function show(Region $region)
    {
        return response()->json([
            'success' => true,
            'data' => $region,
        ]);
    }

    /**
     * Update the specified region.
     */
    public function update(Request $request, Region $region)
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255|unique:regions,name_en,' . $region->id,
            'name_am' => 'required|string|max:255|unique:regions,name_am,' . $region->id,
            'code' => 'nullable|string|max:10',
            'is_active' => 'sometimes|boolean',
        ]);

        $region->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Region updated successfully',
            'data' => $region,
        ]);
    }

    /**
     * Delete the specified region.
     */
    public function destroy(Region $region)
    {
        $region->delete();

        return response()->json([
            'success' => true,
            'message' => 'Region deleted successfully',
        ]);
    }

    /**
     * Toggle region active status.
     */
    public function toggleStatus(Region $region)
    {
        $region->update(['is_active' => !$region->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Region status updated successfully',
            'data' => $region,
        ]);
    }

    /**
     * Get all active regions (for public use in dropdowns).
     */
    public function getActiveRegions()
    {
        $regions = Region::active()
            ->select('id', 'name_en', 'name_am')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $regions,
        ]);
    }
}
