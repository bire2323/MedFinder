<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Hospital;
use App\Models\Pharmacy;
use App\Models\FacilityService;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    private function getFacility()
    {
        $user = auth('sanctum')->user();
        if (!$user) return null;

        if ($user->hasRole('hospitalAgent')) {
            return Hospital::where('hospital_agent_id', $user->id)->first();
        } elseif ($user->hasRole('pharmacyAgent')) {
            return Pharmacy::where('pharmacy_agent_id', $user->id)->first();
        }
        
        // Fallback checks
        $hospital = Hospital::where('hospital_agent_id', $user->id)->first();
        if ($hospital) return $hospital;
        
        return Pharmacy::where('pharmacy_agent_id', $user->id)->first();
    }

    /**
     * Display a listing of the services for the agent's facility.
     */
    public function index()
    {
        $facility = $this->getFacility();
        if (!$facility) {
            return response()->json([]);
        }
        
        $services = FacilityService::with('service')
            ->where('addressable_id', $facility->id)
            ->where('addressable_type', get_class($facility))
            ->get()
            ->map(function ($fs) {
                $service = $fs->service;
                if ($service) {
                    $service->is_available = $fs->is_available;
                    $service->notes = $fs->notes;
                    $service->facility_service_id = $fs->id;
                }
                return $service;
            })->filter();

        return response()->json($services);
    }

    /**
     * Store a newly created service and attach to facility.
     */
    public function store(Request $request)
    {
        $facility = $this->getFacility();
        if (!$facility) {
            $this->logAudit($request, 'SERVICE_ATTACH', 'Service attach failed: facility not found for agent', 'failed', 'service', [], auth('sanctum')->id());
            return response()->json(['message' => 'Facility not found for this agent'], 404);
        }

        $validated = $request->validate([
            'service_name_en' => 'required|string|max:255',
            'service_name_am' => 'required|string|max:255',
            'service_category_name_en' => 'nullable|string|max:255',
            'service_category_name_am' => 'nullable|string|max:255',
            'is_available' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        // Check if service already exists globally
        $service = Service::where('service_name_en', $validated['service_name_en'])->first();
        $createdNew = false;

        if (!$service) {
            $service = Service::create([
                'service_name_en' => $validated['service_name_en'],
                'service_name_am' => $validated['service_name_am'],
                'service_category_name_en' => $validated['service_category_name_en'] ?? null,
                'service_category_name_am' => $validated['service_category_name_am'] ?? null,
            ]);
            $createdNew = true;
        }

        // Create or update connection to facility
        $facilityService = FacilityService::updateOrCreate(
            [
                'addressable_id' => $facility->id,
                'addressable_type' => get_class($facility),
                'service_id' => $service->id,
            ],
            [
                'is_available' => $request->input('is_available', true),
                'notes' => $request->input('notes'),
            ]
        );

        $this->logAudit($request, 'SERVICE_ATTACH', 'Service attached to facility', 'success', 'service', [
            'facility_type' => class_basename($facility),
            'facility_id' => $facility->id,
            'service_id' => $service->id,
            'facility_service_id' => $facilityService->id,
            'created_new_service' => $createdNew,
            'is_available' => (bool) $request->input('is_available', true),
        ], auth('sanctum')->id());

        return response()->json($service, 201);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'service_name_en' => 'required|string|max:255',
            'service_name_am' => 'required|string|max:255',
            'service_category_name_en' => 'nullable|string|max:255',
            'service_category_name_am' => 'nullable|string|max:255',
            'is_available' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $service->update([
            'service_name_en' => $validated['service_name_en'],
            'service_name_am' => $validated['service_name_am'],
            'service_category_name_en' => $validated['service_category_name_en'] ?? null,
            'service_category_name_am' => $validated['service_category_name_am'] ?? null,
        ]);

        $facility = $this->getFacility();
        if ($facility) {
            FacilityService::where('addressable_id', $facility->id)
                ->where('addressable_type', get_class($facility))
                ->where('service_id', $service->id)
                ->update([
                    'is_available' => $request->input('is_available', true),
                    'notes' => $request->input('notes'),
                ]);
        }

        $this->logAudit($request, 'SERVICE_UPDATE', 'Service updated', 'success', 'service', [
            'service_id' => $service->id,
            'facility_type' => $facility ? class_basename($facility) : null,
            'facility_id' => $facility?->id,
            'updated_fields' => array_keys($validated ?? []),
        ], auth('sanctum')->id());

        return response()->json($service);
    }

    /**
     * Remove the service from facility (detach).
     */
    public function destroy(Service $service)
    {
        $facility = $this->getFacility();
        if ($facility) {
            FacilityService::where('addressable_id', $facility->id)
                ->where('addressable_type', get_class($facility))
                ->where('service_id', $service->id)
                ->delete();
        }

        $this->logAudit(request(), 'SERVICE_DETACH', 'Service detached from facility', 'success', 'service', [
            'service_id' => $service->id,
            'facility_type' => $facility ? class_basename($facility) : null,
            'facility_id' => $facility?->id,
        ], auth('sanctum')->id());

        return response()->json(['success' => true]);
    }

    /**
     * Search services.
     */
    public function search(Request $request)
    {
        $query = $request->query('q');
        $services = Service::where('service_name_en', 'LIKE', "%{$query}%")
            ->orWhere('service_name_am', 'LIKE', "%{$query}%")
            ->get();

        return response()->json($services);
    }
}
