<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use Illuminate\Http\Request;
use App\Models\Location;

class PharmacyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(){

    $pharmacys= Pharmacy::with('addresses')->get();


   
    
    return response()->json([
        'success' => true,
        'data' => $pharmacys,
    ], 200);
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
            'pharmacy_type' => 'required|string|max:100',
          
           

            // Files
            'license_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'logo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB max
        ]);

        try {
           $user =auth('sanctum')->user();
           if (!$user) {
            return response()->json(['success'=>false,"message"=>"unauthorized"]);
           }

            // 3. Store License Document
            $licensePath = $request->file('license_document')->store('licenses/pharmacies', 'public');
            $logoPath = $request->hasFile('logo')
                ? $request->file('logo')->store('logos/pharmacies', 'public')
                : null;
              
            // 4. Create Hospital Record
            $pharmacy = Pharmacy::create([
                'pharmacy_agent_id' => $user->id,
                'pharmacy_name_en' => $validated['facilityNameEn'],
                'pharmacy_name_am' => $validated['facilityNameAm'],
                'license_number' => $validated['license_number'],
                'pharmacy_license_category' => $validated['pharmacy_type'],
                'pharmacy_license_upload' => $licensePath,
                'working_hour' => $validated["working_hour"], // Can be updated later
               "address_description_en"=>$validated['detailed_address_en'] ?? null,
               "address_description_am"=>$validated['detailed_address_am'] ?? null,
                'logo' => $logoPath, // 2MB max
                
                'status' => 'PENDING', 
            ]);
            
            // 5. Create Location Record (polymorphic)
            Location::create([
                'addressable_id' => $pharmacy->id,
                'addressable_type' => Pharmacy::class,
                'region_en' => $validated['region_en'],
                'region_am' => $validated['region_am'],
                'zone_en' => $validated['zone_en'],
                'zone_am' => $validated['zone_am'],
                'sub_city_en' => $validated['sub_city_en'],
                'sub_city_am' => $validated['sub_city_am'],
                'kebele' => $validated['kebele'] ?? null,
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'address_type' => 'main', 
            ]);
            $user->syncRoles('pharmacyAgent');

            // 6. Return success response
            return response()->json([
                'success' => true,
                'message' => 'pharmacy registration submitted successfully. Waiting for admin approval.',
               
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
    public function show(Pharmacy $pharmacy)
    {
         $pharmacy = Pharmacy::with('addresses')->find($pharmacy->id)->first();

        return response()->json(["success"=>true,"data"=>$pharmacy]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pharmacy $pharmacy)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Pharmacy $pharmacy)
    {
        //
    }
}
