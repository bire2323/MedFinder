<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Region;
use Illuminate\Http\Request;

/**
 * Admin City Controller
 * Path: app/Http/Controllers/Admin/CityController.php
 */
class AdminCityController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Display a listing of cities with pagination, search, and region filter.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $regionId = $request->query('region_id');
        $perPage = $request->query('per_page', 15);

        $query = City::with('region');

        if ($regionId) {
            $query->where('region_id', $regionId);
        }

        if ($search) {
            $query->search($search);
        }

        $cities = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $cities->items(),
            'pagination' => [
                'total' => $cities->total(),
                'per_page' => $cities->perPage(),
                'current_page' => $cities->currentPage(),
                'last_page' => $cities->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created city.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'region_id' => 'required|exists:regions,id',
            'name_en' => 'required|string|max:255',
            'name_am' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        // Check for unique city name per region
        $existsEn = City::where('region_id', $validated['region_id'])
            ->where('name_en', $validated['name_en'])
            ->exists();

        $existsAm = City::where('region_id', $validated['region_id'])
            ->where('name_am', $validated['name_am'])
            ->exists();

        if ($existsEn) {
            return response()->json([
                'success' => false,
                'message' => 'A city with this English name already exists in the selected region',
            ], 422);
        }

        if ($existsAm) {
            return response()->json([
                'success' => false,
                'message' => 'A city with this Amharic name already exists in the selected region',
            ], 422);
        }
      $existsTrashEn = City::withTrashed()->where('region_id', $validated['region_id'])
            ->where('name_en', $validated['name_en'])
            ->exists();

        $existsTrashAm = City::withTrashed()->where('region_id', $validated['region_id'])
            ->where('name_am', $validated['name_am'])
            ->exists();
        if ($existsTrashEn || $existsTrashAm) {
           $city = City::withTrashed()->where('region_id', $validated['region_id'])
            ->where(function($query) use ($validated) {
                $query->where('name_en', $validated['name_en'])
                      ->orWhere('name_am', $validated['name_am']);
            })->first();
         if ($city->trashed()) {
             $city = $city->restore();

         }
        }else{

            $city = City::create($validated);
             $city->load('region');
        }


        return response()->json([
            'success' => true,
            'message' => 'City created successfully',
            'data' => $city,
        ], 201);
    }

    /**
     * Display the specified city.
     */
    public function show(City $city)
    {
        $city->load('region');

        return response()->json([
            'success' => true,
            'data' => $city,
        ]);
    }

    /**
     * Update the specified city.
     */
    public function update(Request $request, City $city)
    {
        $validated = $request->validate([
            'region_id' => 'required|exists:regions,id',
            'name_en' => 'required|string|max:255',
            'name_am' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        // Check for unique city name per region (excluding current city)
        $existsEn = City::where('region_id', $validated['region_id'])
            ->where('name_en', $validated['name_en'])
            ->where('id', '!=', $city->id)
            ->exists();

        $existsAm = City::where('region_id', $validated['region_id'])
            ->where('name_am', $validated['name_am'])
            ->where('id', '!=', $city->id)
            ->exists();

        if ($existsEn) {
            return response()->json([
                'success' => false,
                'message' => 'A city with this English name already exists in the selected region',
            ], 422);
        }

        if ($existsAm) {
            return response()->json([
                'success' => false,
                'message' => 'A city with this Amharic name already exists in the selected region',
            ], 422);
        }

        $city->update($validated);
        $city->load('region');

        return response()->json([
            'success' => true,
            'message' => 'City updated successfully',
            'data' => $city,
        ]);
    }

    /**
     * Delete the specified city.
     */
    public function destroy(City $city)
    {
        $city->delete();

        return response()->json([
            'success' => true,
            'message' => 'City deleted successfully',
        ]);
    }

    /**
     * Toggle city active status.
     */
    public function toggleStatus(City $city)
    {
        $city->update(['is_active' => !$city->is_active]);
        $city->load('region');

        return response()->json([
            'success' => true,
            'message' => 'City status updated successfully',
            'data' => $city,
        ]);
    }

    /**
     * Get cities by region (for public use in dropdowns).
     */
    public function getCitiesByRegion(Region $region)
    {
        $cities = $region->activeCities()
            ->select('id', 'name_en', 'name_am', 'region_id')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $cities,
        ]);
    }
}
