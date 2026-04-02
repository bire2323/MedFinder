<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Models\Pharmacy;
use App\Models\Drug;
use App\Models\Location;

class RouteController extends Controller
{
    private $orsApiKey;

    public function __construct()
    {
        $this->orsApiKey = config('services.ors.key');
    }

    /**
     * Get route between two points.
     * GET /api/route?from=lat,lng&to=lat,lng
     */
    public function getRoute(Request $request)
    {
        $request->validate([
            'from' => 'required|string',
            'to' => 'required|string',
        ]);

        $from = explode(',', $request->query('from'));
        $to = explode(',', $request->query('to'));

        if (count($from) !== 2 || count($to) !== 2) {
            return response()->json(['error' => 'Invalid coordinates format. Use lat,lng'], 400);
        }

        $cacheKey = "route_{$request->query('from')}_{$request->query('to')}";

        return Cache::remember($cacheKey, 3600, function () use ($from, $to) {
            return $this->fetchRouteFromORS($from, $to);
        });
    }

    /**
     * Smart Pharmacy Selection + Route
     * GET /api/smart-pharmacy?from=lat,lng&drug=drug_name
     */
    public function smartPharmacy(Request $request)
    {
        $request->validate([
            'from' => 'required|string',
            'drug' => 'required|string',
        ]);

        $userPos = explode(',', $request->query('from'));
        $drugName = $request->query('drug');

        if (count($userPos) !== 2) {
            return response()->json(['success' => false, 'message' => 'Invalid user coordinates'], 400);
        }

        // 1. Find drugs
        $drugIds = Drug::where('generic_name', 'like', "%{$drugName}%")
            ->orWhere('brand_name_en', 'like', "%{$drugName}%")
            ->pluck('id');

        if ($drugIds->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No matching drugs found'], 404);
        }

        // 2. Find pharmacies
        $pharmacies = Pharmacy::where('status', 'APPROVED')
            ->whereHas('drugs', function ($query) use ($drugIds) {
                $query->whereIn('drugs.id', $drugIds)
                      ->where('pharmacy_drug_inventories.stock', '>', 0);
            })
            ->with(['addresses', 'drugs' => function($q) use ($drugIds) {
                $q->whereIn('drugs.id', $drugIds);
            }])
            ->get();

        if ($pharmacies->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No pharmacies have this drug in stock'], 404);
        }

        // 3. Rank by Haversine
        $ranked = $pharmacies->map(function ($pharmacy) use ($userPos) {
            $address = $pharmacy->addresses->first();
            if (!$address) return null;

            $dist = $this->haversineDistance(
                (float)$userPos[0], (float)$userPos[1],
                (float)$address->latitude, (float)$address->longitude
            );

            return [
                'pharmacy' => $pharmacy,
                'distance_km' => $dist,
                'lat' => (float)$address->latitude,
                'lng' => (float)$address->longitude
            ];
        })->filter()->sortBy('distance_km')->values();

        if ($ranked->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'No valid pharmacy locations'], 404);
        }

        // 4. Pick best
        $best = $ranked->first();
        $targetPos = [$best['lat'], $best['lng']];

        $route = $this->fetchRouteFromORS($userPos, $targetPos);

        return response()->json([
            'success' => true,
            'pharmacy' => $best['pharmacy'],
            'route' => $route
        ]);
    }

    /**
     * Fetch route safely from ORS
     */
    private function fetchRouteFromORS($start, $end)
    {
        try {
            // ORS expects [lng, lat]
            $start_coords = [(float)$start[1], (float)$start[0]];
            $end_coords = [(float)$end[1], (float)$end[0]];

            $response = Http::withHeaders([
                'Authorization' => $this->orsApiKey,
                'Accept' => 'application/json, application/geo+json',
                'Content-Type' => 'application/json'
            ])->post('https://api.openrouteservice.org/v2/directions/driving-car/geojson', [
                'coordinates' => [$start_coords, $end_coords],
                'instructions' => true,
                'preference' => 'fastest',
                'units' => 'm'
            ]);

            if ($response->failed()) {
                \Log::error('ORS request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return $this->fallbackRoute($start, $end, 'ORS request failed');
            }

            $data = $response->json();

            // Support both GeoJSON (features) and Standard JSON (routes) for robustness
            if (isset($data['features']) && !empty($data['features'])) {
                $feature = $data['features'][0];
                $coords = $feature['geometry']['coordinates']; // [[lng, lat], ...]
                $properties = $feature['properties'];
                $segments = $properties['segments'][0] ?? null;

                if (!$segments) return $this->fallbackRoute($start, $end, 'No segments found');

                return [
                    'geometry' => $feature['geometry'],
                    'distance' => $properties['summary']['distance'] ?? 0,
                    'duration' => $properties['summary']['duration'] ?? 0,
                    'steps' => array_map(function($step) use ($coords) {
                        $waypointIndex = $step['way_points'][0] ?? 0;
                        $point = $coords[$waypointIndex] ?? [0, 0];
                        return [
                            'instruction' => $step['instruction'] ?? '',
                            'distance' => $step['distance'] ?? 0,
                            'duration' => $step['duration'] ?? 0,
                            'type' => $step['type'] ?? null,
                            'lat' => $point[1],
                            'lng' => $point[0]
                        ];
                    }, $segments['steps'])
                ];
            } elseif (isset($data['routes']) && !empty($data['routes'])) {
                // Backward compatibility if ORS returns standard JSON
                $route = $data['routes'][0];
                $summary = $route['summary'] ?? [];
                $segments = $route['segments'][0] ?? [];

                return [
                    'geometry' => [
                        'type' => 'LineString',
                        'coordinates' => $this->decodePolyline($route['geometry'])
                    ],
                    'distance' => $summary['distance'] ?? 0,
                    'duration' => $summary['duration'] ?? 0,
                    'steps' => array_map(function($step) {
                        return [
                            'instruction' => $step['instruction'] ?? '',
                            'distance' => $step['distance'] ?? 0,
                            'duration' => $step['duration'] ?? 0,
                            'type' => $step['type'] ?? null,
                            'lat' => null, 
                            'lng' => null
                        ];
                    }, $segments['steps'] ?? [])
                ];
            }

            \Log::error('Invalid ORS response structure', ['response' => $data]);
            return $this->fallbackRoute($start, $end, 'Invalid response structure');

        } catch (\Exception $e) {
            \Log::error('ORS exception', ['error' => $e->getMessage()]);

            return $this->fallbackRoute($start, $end, 'Exception occurred');
        }
    }

    /**
     * Fallback when ORS fails
     */
    private function fallbackRoute($start, $end, $reason = '')
    {
        $distanceKm = $this->haversineDistance(
            (float)$start[0], (float)$start[1],
            (float)$end[0], (float)$end[1]
        );

        return [
            'geometry' => null,
            'distance' => $distanceKm * 1000, // meters
            'duration' => 0,
            'steps' => [],
            'fallback' => true,
            'message' => $reason
        ];
    }

    /**
     * Haversine Distance
     */
    private function haversineDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Decode Google-style polyline
     */
    private function decodePolyline($encoded)
    {
        $length = strlen($encoded);
        $index = 0;
        $points = [];
        $lat = 0;
        $lng = 0;

        while ($index < $length) {
            $shift = 0;
            $result = 0;
            do {
                $b = ord($encoded[$index++]) - 63;
                $result |= ($b & 0x1f) << $shift;
                $shift += 5;
            } while ($b >= 0x20);
            $dlat = (($result & 1) ? ~($result >> 1) : ($result >> 1));
            $lat += $dlat;

            $shift = 0;
            $result = 0;
            do {
                $b = ord($encoded[$index++]) - 63;
                $result |= ($b & 0x1f) << $shift;
                $shift += 5;
            } while ($b >= 0x20);
            $dlng = (($result & 1) ? ~($result >> 1) : ($result >> 1));
            $lng += $dlng;

            $points[] = [$lng * 1e-5, $lat * 1e-5]; // [lng, lat]
        }
        return $points;
    }
}