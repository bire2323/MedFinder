<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class OSRMServices
{
    protected $baseUrl;

    public function __construct()
    {
        // [SELF-HOSTED] Self-hosted OSRM Docker container — uncomment to revert
        // $this->baseUrl = config('services.OSRM.base_url');

        // [FREE-TEST] Public OSRM instance — no signup, no card required
        // Rate-limited, for testing only. Switch back to self-hosted for production.
        $this->baseUrl = 'https://router.project-osrm.org';
    }

  public function getRoute($startLat, $startLng, $endLat, $endLng, $withSteps = false)
{
    $url = "{$this->baseUrl}/route/v1/driving/$startLng,$startLat;$endLng,$endLat";

    $query = [
        'overview' => 'full',
        'geometries' => 'geojson'
    ];

    // 👇 ADD THIS
    if ($withSteps) {
        $query['steps'] = 'true';
    }

    $response = Http::get($url, $query);

    $data = $response->json();

    return $this->formatRoute($data, $withSteps);
}

 

    private function formatRoute($data, $withSteps = false)
{
    $route = $data['routes'][0];

    $coordinates = array_map(function ($coord) {
        return [$coord[1], $coord[0]];
    }, $route['geometry']['coordinates']);

    $result = [
        'geometry' => [
            'coordinates' => $route['geometry']['coordinates']
        ],
        'distance' => $route['distance'],
        'duration' => $route['duration'],
    ];

    // 👇 ADD THIS BLOCK
    if ($withSteps) {
        $steps = $route['legs'][0]['steps'] ?? [];

        $result['steps'] = array_map(function ($step) {
            return [
                'instruction' => $step['maneuver']['instruction'] ?? '',
                'distance' => $step['distance'],
                'duration' => $step['duration'],
                'lat' => $step['maneuver']['location'][1],
                'lng' => $step['maneuver']['location'][0],
                'type' => $step['maneuver']['type'] ?? ''
            ];
        }, $steps);
    }

    return $result;
}
}