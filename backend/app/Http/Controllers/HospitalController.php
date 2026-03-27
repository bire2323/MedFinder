<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Hospital;
use App\Models\User;
use App\Events\NotificationSent;
use Illuminate\Http\Request;
use App\Models\Location;

class HospitalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $hospitals = Hospital::with('addresses')
            ->where('status', 'APPROVED')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $hospitals,
        ]);
    }

    /**
     * Search hospitals by location (radius search).
     */
    public function searchByLocation(Request $request)
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $radius = $request->query('radius', 10); // Default 10km

        $query = Hospital::with('addresses')
            ->where('status', 'APPROVED');

        if ($lat && $lng) {
            // Basic haversine or distance filter if needed, 
            // for now returning all APPROVED for simplicity in this implementation step
            // or filtering by lat/lng range
            $query->whereHas('addresses', function($q) use ($lat, $lng, $radius) {
                $q->whereBetween('latitude', [$lat - 0.1, $lat + 0.1])
                  ->whereBetween('longitude', [$lng - 0.1, $lng + 0.1]);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validate all incoming data
        $validated = $request->validate([
            // Basic Info
            'facilityNameEn' => 'required|string|min:3|max:255',
            'facilityNameAm' => 'required|string|min:3|max:255',
         
            'email' => 'nullable|email|unique:users,email',
          
            
            // Location Info
            'region_en' => 'required|string|max:255',
            'region_am' => 'required|string|max:255',
            'zone_en' => 'required|string|max:255',
            'zone_am' => 'required|string|max:255',
            'sub_city_en' => 'required|string|max:255',
            'sub_city_am' => 'required|string|max:255',
            'kebele' => 'nullable|string|max:100',
            'detailed_address_en' => 'nullable|string|max:500',
            'detailed_address_am' => 'nullable|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'working_hour' => 'required|string',
            'emergency_contact' => 'nullable|string',

            // Hospital Verification
            'license_number' => 'required|string|max:100',
            'ownership_type' => 'required|string|max:100',
            'provides_emergency' => 'required|boolean',
            'operates_24_hours' => 'required|boolean',

            // Files
            'license_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'logo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB max
        ]);

        try {
           $user =auth('sanctum')->user();
         //  Log::info('User logged in', ['user_id' => auth('sanctum')->id(), 'ip' => request()->ip()]);
           if (!$user) {
            return response()->json(['success'=>false,"message"=>"unauthorized"]);
           }

            // 3. Store License Document
            $licensePath = $request->file('license_document')->store('licenses/hospitals', 'public');
            $logoPath = $request->hasFile('logo')
                ? $request->file('logo')->store('logos/hospitals', 'public')
                : null;

            // 4. Create Hospital Record
            $hospital = Hospital::create([
                'hospital_agent_id' => $user->id,
                'hospital_name_en' => $validated['facilityNameEn'],
                'hospital_name_am' => $validated['facilityNameAm'],
                'license_number' => $validated['license_number'],
                'hospital_ownership_type' => $validated['ownership_type'],
                'official_license_upload' => $licensePath,
                'working_hour' => $validated["working_hour"], // Can be updated later
                "address_description_en"=>$validated["detailed_address_en"],
                "address_description_am"=>$validated["detailed_address_am"],
                'logo' => $logoPath,
                'is_full_time_service' => $validated['operates_24_hours'],
                'emergency_contact' => $validated['alternate_phone'] ?? $validated['emergency_contact'],
                'status' => 'PENDING', // Admin will approve later
            ]);
            
            // 5. Create Location Record (polymorphic)
            Location::create([
                'addressable_id' => $hospital->id,
                'addressable_type' => Hospital::class,
                'region_en' => $validated['region_en'],
                'region_am' => $validated['region_am'],
                'zone_en' => $validated['zone_en'],
                'zone_am' => $validated['zone_am'],
                'sub_city_en' => $validated['sub_city_en'],
                'sub_city_am' => $validated['sub_city_am'],
                'kebele' => $validated['kebele'] ?? null,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'address_type' => 'main', // or 'branch' if you support multiple
            ]);
            $user->syncRoles('hospitalAgent');

            // 6. Notify Admins in real-time
            $admins = \App\Models\User::role('admin')->get();
            foreach ($admins as $admin) {
                $notification = Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'approval',
                    'priority' => 'high',
                    'title' => 'New Hospital Registered',
                    'message' => "{$hospital->hospital_name_en} requires your approval.",
                ]);
                event(new NotificationSent($notification));
            }

            // 7. Return success response
            return response()->json([
                'success' => true,
                'message' => 'Hospital registration submitted successfully. Waiting for admin approval.',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Hospital $hospital)
    {
        $hospital = Hospital::with('addresses')->find($hospital->id);

        return response()->json(["success"=>true,"data"=>$hospital]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Hospital $hospital)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Hospital $hospital)
    {
        //
    }
}
