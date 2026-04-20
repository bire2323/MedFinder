<?php

namespace App\Http\Controllers;

use App\Models\Pharmacy;
use App\Models\User;
use App\Models\Notification;
use App\Events\NotificationSent;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class PharmacyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pharmacies = Pharmacy::with('addresses')
            ->where('status', 'APPROVED')
            ->get();
        $pharmacies =  $pharmacies->map(function ($pharmacy) {
            $pharmacy->logo = asset('storage/' . $pharmacy->logo);
            $pharmacy->license_document = asset('storage/' . $pharmacy->license_document);
            return $pharmacy;
        });

        return response()->json([
            'success' => true,
            'data' => $pharmacies,
        ], 200);
    }

    public function getPharmaProfile()
    {
        $pharmacy = auth('sanctum')->user()->pharmacy->load('addresses');

        return response()->json([
            'success' => true,
            'data' => $pharmacy,
        ], 200);
    }
 public function updateProfile(Request $request, $id)
{
    try {
        DB::beginTransaction();
        
        $pharmacy = Pharmacy::find($id);
        if (!$pharmacy) {
            return response()->json([
                'success' => false,
                'message' => 'Pharmacy not found',
            ], 404);
        }
        
        // Fix boolean fields
        if ($request->has('is_full_time_service')) {
            $value = $request->input('is_full_time_service');
            if ($value === 'false' || $value === false || $value === 0 || $value === '0') {
                $request->merge(['is_full_time_service' => false]);
            } elseif ($value === 'true' || $value === true || $value === 1 || $value === '1') {
                $request->merge(['is_full_time_service' => true]);
            }
        }
        
        // Prepare validation rules
        $rules = [
            'pharmacy_name_en' => 'sometimes|string|max:255',
            'pharmacy_name_am' => 'sometimes|string|max:255',
            'pharmacy_license_category' => 'sometimes|string|max:255',
            'contact_phone' => 'sometimes|string|max:20',
            'contact_email' => 'sometimes|email|max:255',
            'address_description_en' => 'sometimes|string|nullable',
            'address_description_am' => 'sometimes|string|nullable',
            'is_full_time_service' => 'sometimes|boolean',
            'working_hour' => 'sometimes|nullable',
        ];
        
        // Only add file validation if files are actually uploaded
        if ($request->hasFile('logo')) {
            $rules['logo'] = 'image|mimes:jpg,jpeg,png|max:2048';
        }
        
        if ($request->hasFile('pharmacy_license_upload')) {
            $rules['pharmacy_license_upload'] = 'file|mimes:pdf,jpg,jpeg,png|max:5120';
        }
        
        $validated = $request->validate($rules);
        
        // Prepare pharmacy data
        $pharmacyData = $request->except(['addresses', 'logo', 'pharmacy_license_upload']);
        
        // Handle working_hour
        if ($request->has('working_hour')) {
            $workingHour = $request->input('working_hour');
            
            // If it's a string, try to decode it
            if (is_string($workingHour)) {
                $decoded = json_decode($workingHour, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $workingHour = $decoded;
                }
            }
            
            // If it's an array, clean and encode it
            if (is_array($workingHour)) {
                // Remove empty arrays
                $cleaned = [];
                foreach ($workingHour as $day => $hours) {
                    if (!empty($hours) && is_array($hours)) {
                        $cleaned[$day] = $hours;
                    }
                }
                $pharmacyData['working_hour'] = json_encode($cleaned);
            } elseif (is_string($workingHour)) {
                // Validate it's proper JSON
                if (json_validate($workingHour)) {
                    $pharmacyData['working_hour'] = $workingHour;
                } else {
                    $pharmacyData['working_hour'] = '{}';
                }
            } else {
                $pharmacyData['working_hour'] = '{}';
            }
        }
        
        // Update pharmacy
        $pharmacy->update($pharmacyData);
        
        // Handle address - FIX THE ERROR HERE
        if ($request->has('addresses')) {
            $addressData = $request->input('addresses');
            
            // Decode if it's a JSON string
            if (is_string($addressData)) {
                $addressData = json_decode($addressData, true);
            }
            
            // Ensure it's an array
            if (!is_array($addressData)) {
                $addressData = [];
            }
            
            // If addresses is an array with main address at index 0
            if (isset($addressData[0]) && is_array($addressData[0])) {
                $addressData = $addressData[0];
            }
            
            // ONLY unset if it's an array
            if (is_array($addressData)) {
                // Remove fields that shouldn't be updated
                unset($addressData['id']);
                unset($addressData['addressable_id']);
                unset($addressData['addressable_type']);
                unset($addressData['created_at']);
                unset($addressData['updated_at']);
                unset($addressData['deleted_at']);
                
                // Only proceed if we have valid address data
                if (!empty($addressData)) {
                    // Check if pharmacy has an address
                    $existingAddress = $pharmacy->addresses()->first();
                    if ($existingAddress) {
                        $existingAddress->update($addressData);
                    } else {
                        $pharmacy->addresses()->create($addressData);
                    }
                }
            }
        }
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($pharmacy->logo && Storage::disk('public')->exists($pharmacy->logo)) {
                Storage::disk('public')->delete($pharmacy->logo);
            }
            $logoPath = $request->file('logo')->store('logos/pharmacies', 'public');
            $pharmacy->update(['logo' => $logoPath]);
        }
        
        // Handle license upload
        if ($request->hasFile('pharmacy_license_upload')) {
            if ($pharmacy->pharmacy_license_upload && Storage::disk('public')->exists($pharmacy->pharmacy_license_upload)) {
                Storage::disk('public')->delete($pharmacy->pharmacy_license_upload);
            }
            $licensePath = $request->file('pharmacy_license_upload')->store('licenses/pharmacies', 'public');
            $pharmacy->update(['pharmacy_license_upload' => $licensePath]);
        }
        
        DB::commit();
        
        // Load relationships for response
        $pharmacy->load('addresses');
        
        return response()->json([
            'success' => true,
            'message' => 'Pharmacy updated successfully',
            'data' => $pharmacy
        ], 200);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Pharmacy update error: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to update pharmacy',
            'error' => $e->getMessage()
        ], 500);
    }
}
    /**
     * Search pharmacies by location (radius search).
     */
    public function searchByLocation(Request $request)
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $radius = $request->query('radius', 10); // Default 10km

        $query = Pharmacy::with('addresses')
            ->where('status', 'APPROVED');

        if ($lat && $lng) {
            $query->whereHas('addresses', function ($q) use ($lat, $lng, $radius) {
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

            'contact_email' => 'nullable|email|unique:users,email',


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
             'contact_phone' => 'nullable|string',

            // Hospital Verification
            'license_number' => 'required|string|max:100',
            'pharmacy_type' => 'required|string|max:100',



            // Files
            'license_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'logo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB max
        ],[
            'contact_email.unique' => 'Email already exists',

        ]);

        try {
            $user = auth('sanctum')->user();
            if (!$user) {
                return response()->json(['success' => false, "message" => "unauthorized"]);
            }else if($user->hasAnyRole(["hospitalAgent","pharmacyAgent"])){
                    return response()->json([
                        'success' => false,
                        'code' => 'ALREADY_REGISTERED_AGENT',
                        'message' => 'This agent is already registered.'
                    ], 200);
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
                'contact_phone' => $validated["contact_phone"], // Can be updated later
                'contact_email' => $validated["contact_email"], // Can be updated later
                "address_description_en" => $validated['detailed_address_en'] ?? null,
                "address_description_am" => $validated['detailed_address_am'] ?? null,
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

            // 6. Notify Admins in real-time
            $admins = User::role('admin')->get();
            foreach ($admins as $admin) {
                $notification = Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'approval',
                    'priority' => 'high',
                    'title' => 'New Pharmacy Registered',
                    'message' => "{$pharmacy->pharmacy_name_en} requires your approval.",
                ]);
                event(new NotificationSent($notification));
            }

            // 7. Return success response
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
        $pharmacy = Pharmacy::with(['addresses','drugs'])->find($pharmacy->id);


        return response()->json(["success" => true, "data" => $pharmacy]);
    }

public function botIndex(Request $request)
    {
        $query = Pharmacy::with(['addresses', 'drugs.inventory'])
            ->where('status', 'APPROVED');
     
        // 🔍 Filter by pharmacy name
        if ($request->name) {
            $query->where(function ($q) use ($request) {
                $q->where('pharmacy_name_en', 'LIKE', "%{$request->name}%")
                  ->orWhere('pharmacy_name_am', 'LIKE', "%{$request->name}%");
            });
        }

        // 📍 Filter by location (from addresses relation)
        if ($request->location) {
            $query->whereHas('addresses', function ($q) use ($request) {
                $q->where('region_en', 'LIKE', "%{$request->location}%")
                  ->orWhere('zone_en', 'LIKE', "%{$request->location}%")
                  ->orWhere('sub_city_en', 'LIKE', "%{$request->location}%");
            });
        }

        $pharmacies = $query->limit(5)->get();

        // ✅ Transform response for Rasa
        $result = $pharmacies->map(function ($p) {

            $address = $p->addresses->first();

            return [
                "pharmacy" => $p->pharmacy_name_en,
                "location" => $address
                    ? "{$address->region_en}, {$address->zone_en}, {$address->sub_city_en}"
                    : "Unknown",
                "working_hours" => $p->working_hour,
                "phone" => $p->contact_phone,
                "latitude" => $address->latitude ?? null,
                "longitude" => $address->longitude ?? null,
            ];
        });

        return response()->json($result);
}
}
