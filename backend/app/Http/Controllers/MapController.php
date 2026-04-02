<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OSRMServices;

class MapController extends Controller
{
    protected $osrm;

    public function __construct(OSRMServices $osrm)
    {
        $this->osrm = $osrm;
    }

  public function getRoute(Request $request)
{
    $request->validate([
        'from' => 'required|string',
        'to' => 'required|string',
    ]);

    [$startLat, $startLng] = $this->parseCoordinates($request->from);
    [$endLat, $endLng]     = $this->parseCoordinates($request->to);

    // 👇 NEW: read steps flag
    $withSteps = $request->boolean('steps');

    $route = $this->osrm->getRoute($startLat, $startLng, $endLat, $endLng, $withSteps);

    return response()->json($route);
}
    private function parseCoordinates($coordString)
{
    $parts = explode(',', $coordString);

    if (count($parts) !== 2) {
        throw new \Exception("Invalid coordinate format. Use lat,lng");
    }

    $lat = floatval($parts[0]);
    $lng = floatval($parts[1]);

    // Optional: validate ranges
    if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
        throw new \Exception("Invalid coordinate values");
    }

    return [$lat, $lng];
}
}