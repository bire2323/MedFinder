<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Hospital;
use App\Events\NotificationSent;
use Illuminate\Http\Request;
use App\Models\Location;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
      try{
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
            'hospital_ownership_type' => 'required|string|max:100',
            'provides_emergency' => 'required|boolean',
            'operates_24_hours' => 'required|boolean',

            // Files
            'license_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'logo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048', // 2MB max
        ],[
             'facilityNameEn' => 'FACILITY_NAME_REQ',
            'facilityNameAm' => 'FACILITY_NAME_AM_REQ',
         
            'contact_email' => 'CONTACT_EMAIL_REQ',
          
            
            // Location Info
            'region_en' => 'REGION_EN_REQ',
            'region_am' => 'REGION_AM_REQ',
            'zone_en' => 'ZONE_EN_REQ',
            'zone_am' => 'ZONE_AM_REQ',
            'sub_city_en' => 'SUB_CITY_EN_REQ',
            'sub_city_am' => 'SUB_CITY_AM_REQ',
            'kebele' => 'KEBELE_REQ',
            'detailed_address_en' => 'DETAILED_ADDRESS_EN_REQ',
            'detailed_address_am' => 'DETAILED_ADDRESS_AM_REQ',
            'latitude' => 'LATITUDE_REQ',
            'longitude' => 'LONGITUDE_REQ',
            'working_hour' => 'WORKING_HOUR_REQ',
            'contact_phone' => 'CONTACT_PHONE_REQ',
             
            'license_number' => 'LICENCE_REQ',
            'hospital_ownership_type' => 'OWNERSHIP_TYPE_REQ',
            'provides_emergency' => 'PROVIDES_EMERGENCY_REQ',
            'operates_24_hours' => 'OPERATES_24_HOURS_REQ',

            // Files
            'license_document' => 'LICENCE_DOC_REQ',
            'logo' => 'LOGO_REQ', 
        ]);
        } catch (ValidationException $e) {
               return response()->json([
                'success' => false,
                'code' => 'VALIDATION_FAILED',
                'message' => 'Validation failed',
                'errors' => $e->errors(),
              ], 422);
        }

        // 2. Check if user is already a hospital agent
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['success'=>false,"message"=>"unauthorized"]);
        }else if($user->hasAnyRole(["hospitalAgent","pharmacyAgent"])){
            return response()->json([
                'success' => false,
                'code' => 'ALREADY_REGISTERED_AGENT',], 200); // now frontend always sees 200
         }

        try {
           $user =auth('sanctum')->user();
          Log::info('User logged in for hosp booking', ['user_id' => auth('sanctum')->id(), 'ip' => request()->ip()]);
           if (!$user) {
            return response()->json(['success'=>false,"message"=>"unauthorized"]);
           }else if($user->hasAnyRole(["hospitalAgent","pharmacyAgent"])){
                  return response()->json([
                    'success' => false,
                    'code' => 'ALREADY_REGISTERED_AGENT',
                    'message' => 'This agent is already registered.'
                ], 200);
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
                'hospital_ownership_type' => $validated['hospital_ownership_type'],
                'official_license_upload' => $licensePath,
                'working_hour' => $validated["working_hour"], // Can be updated later
                "address_description_en"=>$validated["detailed_address_en"],
                "address_description_am"=>$validated["detailed_address_am"],
                'logo' => $logoPath,
                'is_full_time_service' => $validated['operates_24_hours'],
                'contact_email' => $validated['contact_email'],
                'emergency_contact' => $validated['contact_phone'],
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
          Log::info('User booked hospital', ['user_id' => auth('sanctum')->id()]);
     
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
          Log::info('EVENT BROADCASTED', ['user_id' => $admin->id, 'notification_id' => $notification->id]);

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
    public function updateProfile(Request $request, Hospital $hospital)
    {
    try {
        DB::beginTransaction();
        
        $hospital = Hospital::find($id);
        if (!$hospital) {
            return response()->json([
                'success' => false,
                'message' => 'Hospital not found',
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
            'hospital_name_en' => 'sometimes|string|max:255',
            'hospital_name_am' => 'sometimes|string|max:255',
            'hospital_license_category' => 'sometimes|string|max:255',
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
        
        if ($request->hasFile('hospital_license_upload')) {
            $rules['hospital_license_upload'] = 'file|mimes:pdf,jpg,jpeg,png|max:5120';
        }
        
        $validated = $request->validate($rules);
        
        // Prepare hospital data
        $hospitalData = $request->except(['addresses', 'logo', 'hospital_license_upload']);
        
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
                $hospitalData['working_hour'] = json_encode($cleaned);
            } elseif (is_string($workingHour)) {
                // Validate it's proper JSON
                if (json_validate($workingHour)) {
                    $hospitalData['working_hour'] = $workingHour;
                } else {
                    $hospitalData['working_hour'] = '{}';
                }
            } else {
                $hospitalData['working_hour'] = '{}';
            }
        }
        
        // Update hospital
        $hospital->update($hospitalData);
        
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
                    // Check if hospital has an address
                    $existingAddress = $hospital->addresses()->first();
                    if ($existingAddress) {
                        $existingAddress->update($addressData);
                    } else {
                        $hospital->addresses()->create($addressData);
                    }
                }
            }
        }
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            if ($hospital->logo && Storage::disk('public')->exists($hospital->logo)) {
                Storage::disk('public')->delete($hospital->logo);
            }
            $logoPath = $request->file('logo')->store('logos/hospitals', 'public');
            $hospital->update(['logo' => $logoPath]);
        }
        
        // Handle license upload
        if ($request->hasFile('hospital_license_upload')) {
            if ($hospital->hospital_license_upload && Storage::disk('public')->exists($hospital->hospital_license_upload)) {
                Storage::disk('public')->delete($hospital->hospital_license_upload);
            }
            $licensePath = $request->file('hospital_license_upload')->store('licenses/hospitals', 'public');
            $hospital->update(['hospital_license_upload' => $licensePath]);
        }
        
        DB::commit();
        
        // Load relationships for response
        $hospital->load('addresses');
        
        return response()->json([
            'success' => true,
            'message' => 'Hospital updated successfully',
            'data' => $hospital
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
        Log::error('hospital update error: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to update hospital',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Public: approved hospitals with departments and linked services (for directory search).
     */
    public function publicCapabilities()
    {
        $hospitals = Hospital::with([
            'addresses',
            'departments',
            'services.service',
        ])
            ->where('status', 'APPROVED')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $hospitals,
        ]);
    }

   public function botIndex(Request $request)
{
    $query = Hospital::with(['addresses'])
        ->where('status', 'APPROVED');

    // ✅ FIXED name filter
    if ($request->name) {
        $query->where(function ($q) use ($request) {
            $q->where('hospital_name_en', 'LIKE', "%{$request->name}%")
              ->orWhere('hospital_name_am', 'LIKE', "%{$request->name}%");
        });
    }

    // ✅ Location filter
    if ($request->location) {
        $query->whereHas('addresses', function ($q) use ($request) {
            $q->where('region_en', 'LIKE', "%{$request->location}%")
              ->orWhere('zone_en', 'LIKE', "%{$request->location}%")
              ->orWhere('sub_city_en', 'LIKE', "%{$request->location}%");
        });
    }

    $hospitals = $query->limit(5)->get();

    $result = $hospitals->map(function ($h) {

        $address = $h->addresses->first();

        return [
            "name" => $h->hospital_name_en, // ✅ FIXED
            "location" => $address
                ? "{$address->region_en}, {$address->zone_en}, {$address->sub_city_en}"
                : "Unknown",
            "phone" => $h->contact_phone,
            "latitude" => $address->latitude ?? null,
            "longitude" => $address->longitude ?? null,
        ];
    });

    return response()->json($result);
}
    public function getAgentHospital()
    {
        $user = auth('sanctum')->user();
\Log::info('User logged in', ['user_id' => $user->id]);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
\Log::info('User logged in', ['user_id' => $user->id]);
        $hospital = Hospital::with('addresses')->where('hospital_agent_id', $user->id)->first();
\Log::info('Hospital found', ['hospital' => $hospital]);
        // Return 200 with null if not found, to avoid breaking the dashboard on new accounts
        return response()->json(['success' => true, 'data' => $hospital]);
    }
}
