<?php

namespace App\Http\Controllers;

use App\Models\Hospital;
use App\Models\Pharmacy;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class ChatSessionController extends Controller
{
    private string $openAiKey;
    private string $openAiModel;

    public function __construct()
    {
        $this->openAiKey  = config('services.openai.key');
        $this->openAiModel = config('services.openai.model', 'gpt-4o-mini');
    }

    /**
     * Main chat endpoint
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'lat'     => 'required|numeric|between:-90,90',
            'lng'     => 'required|numeric|between:-180,180',
            'lang'    => 'required|in:en,am',
        ]);

        $message = trim($validated['message']);
        $lat     = (float) $validated['lat'];
        $lng     = (float) $validated['lng'];
        $lang    = $validated['lang'];

        // 1. Detect intent
        $intentData = $this->detectIntent($message, $lang);

        // 2. Route based on intent
        return match ($intentData['intent'] ?? 'unknown') {
            'drug_search'           => $this->handleDrugSearch($intentData['drug'] ?? '', $lat, $lng, $lang),
            'nearest_pharmacy'      => $this->handleNearestPharmacy($lat, $lng, $lang),
            'nearest_hospital'      => $this->handleNearestHospital($lat, $lng, $lang),
            'hospital_department'   => $this->handleHospitalByDepartment($intentData['department'] ?? '', $lat, $lng, $lang),
            'image_extraction'      => $this->handleImageExtraction($request, $lang), // if you plan to support it
            default                 => $this->handleFallback($message, $lang),
        };
    }

    // ──────────────────────────────────────────────
    //  Intent Detection
    // ──────────────────────────────────────────────

    private function detectIntent(string $message, string $lang): array
    {
        $systemPrompt = $lang === 'am'
            ? "የተጠቃሚውን መልእክት ተንትን እና የሚከተሉትን ብቻ በJSON መልክ መልስ፡ {\"intent\": \"...\", \"drug\": \"...\", \"department\": \"...\"}\nየሚቻሉ ኢንቴንቶች፡ drug_search, nearest_pharmacy, nearest_hospital, hospital_department, unknown"
            : "Analyze the user message and return ONLY JSON: {\"intent\": \"...\", \"drug\": \"...\", \"department\": \"...\"}\nPossible intents: drug_search, nearest_pharmacy, nearest_hospital, hospital_department, unknown";

        $response = Http::withToken($this->openAiKey)
            ->timeout(12)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'    => $this->openAiModel,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $message],
                ],
                'temperature' => 0.1,
                'max_tokens'  => 120,
            ]);

        if (!$response->successful()) {
            return ['intent' => 'unknown'];
        }

        $content = $response->json()['choices'][0]['message']['content'] ?? '{}';

        return json_decode($content, true) ?: ['intent' => 'unknown'];
    }

    // ──────────────────────────────────────────────
    //  Handlers – each intent has its own method
    // ──────────────────────────────────────────────

    private function handleDrugSearch(string $drugName, float $lat, float $lng, string $lang)
    {
        if (empty(trim($drugName))) {
            return $this->errorResponse('No drug name detected', $lang);
        }

        $drugColumn = $lang === 'am' ? 'generic_name_am' : 'generic_name_en';

        $pharmacies = Pharmacy::query()
            ->selectRaw("
                pharmacies.*,
                ST_Distance_Sphere(
                    point(longitude, latitude),
                    point(?, ?)
                ) / 1000 AS distance
            ", [$lng, $lat])
            ->whereHas('inventory.drug', fn($q) => $q->where($drugColumn, 'LIKE', "%{$drugName}%"))
            ->whereHas('inventory', fn($q) => $q->where('is_available', true))
            ->orderBy('distance')
            ->limit(5)
            ->get();

        if ($pharmacies->isEmpty()) {
            return $this->textResponse(
                $lang === 'am' ? "ለ \"{$drugName}\" በአቅራቢያዎ ያለ ፋርማሲ አልተገኘም።" : "No pharmacies found near you with {$drugName}.",
                $lang
            );
        }

        return response()->json([
            'type'      => 'drug_result',
            'lang'      => $lang,
            'drug'      => $drugName,
            'pharmacies' => $this->localizePharmacies($pharmacies, $lang),
        ]);
    }

    private function handleNearestPharmacy(float $lat, float $lng, string $lang)
    {
        // Similar logic as drug search but without drug filter
        $pharmacies = Pharmacy::query()
            ->selectRaw("
                pharmacies.*,
                ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) / 1000 AS distance
            ", [$lng, $lat])
            ->orderBy('distance')
            ->limit(5)
            ->get();

        return response()->json([
            'type'       => 'pharmacy_result',
            'lang'       => $lang,
            'pharmacies' => $this->localizePharmacies($pharmacies, $lang),
        ]);
    }

    private function handleNearestHospital(float $lat, float $lng, string $lang)
    {
        $locations = $this->findNearestFacilities(Hospital::class, $lat, $lng, 5);

        return response()->json([
            'type' => 'hospital_result',
            'lang' => $lang,
            'data' => $this->formatLocations($locations, $lang),
        ]);
    }

    private function handleHospitalByDepartment(string $department, float $lat, float $lng, string $lang)
    {
        if (empty(trim($department))) {
            return $this->errorResponse('No department specified', $lang);
        }

        $column = $lang === 'am' ? 'department_name_am' : 'department_name_en';

        $locations = Location::query()
            ->where('addressable_type', Hospital::class)
            ->whereHasMorph('addressable', Hospital::class, function ($q) use ($column, $department) {
                $q->whereHas('departments', fn($d) => $d->where($column, 'LIKE', "%{$department}%"));
            })
            ->selectRaw("
                locations.*,
                ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) / 1000 AS distance
            ", [$lng, $lat])
            ->orderBy('distance')
            ->limit(5)
            ->get();

        return response()->json([
            'type' => 'hospital_department_result',
            'lang' => $lang,
            'data' => $this->formatLocations($locations, $lang),
        ]);
    }

    private function handleFallback(string $message, string $lang)
    {
        $systemPrompt = $lang === 'am'
            ? "እርዳታ የሚሰጥ የፋርማሲ ረዳት ነህ። በአማርኛ መልስ ስጥ። አጭር እና ጠቃሚ ሁን።"
            : "You are a helpful pharmacy assistant. Respond in English. Keep it short and useful.";

        $response = Http::withToken($this->openAiKey)
            ->timeout(10)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'    => $this->openAiModel,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $message],
                ],
                'temperature' => 0.7,
                'max_tokens'  => 300,
            ]);

        $reply = $response->successful()
            ? trim($response->json()['choices'][0]['message']['content'] ?? 'Sorry, I could not process that.')
            : ($lang === 'am' ? 'ይቅርታ፣ መልስ መስጠት አልቻልኩም።' : 'Sorry, I could not process that.');

        return $this->textResponse($reply, $lang);
    }

    // ──────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────

    private function localizePharmacies($pharmacies, string $lang): array
    {
        return $pharmacies->map(fn($p) => [
            'id'      => $p->id,
            'name'    => $lang === 'am' ? ($p->name_am ?? $p->name_en) : ($p->name_en ?? $p->name),
            'address' => $lang === 'am' ? ($p->address_am ?? $p->address_en) : ($p->address_en ?? $p->address),
            'distance'=> round($p->distance, 2),
            'lat'     => $p->latitude,
            'lng'     => $p->longitude,
        ])->all();
    }

    private function findNearestFacilities(string $class, float $lat, float $lng, int $limit = 5)
    {
        return Location::query()
            ->where('addressable_type', $class)
            ->selectRaw("
                locations.*,
                ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) / 1000 AS distance
            ", [$lng, $lat])
            ->orderBy('distance')
            ->limit($limit)
            ->get();
    }

    private function formatLocations($locations, string $lang): array
    {
        return $locations->map(function ($loc) use ($lang) {
            $facility = $loc->addressable;

            return [
                'facility_type' => class_basename($loc->addressable_type),
                'name'         => $lang === 'am' ? ($facility->name_am ?? $facility->name_en) : ($facility->name_en ?? $facility->name),
                'region'       => $lang === 'am' ? ($loc->region_am ?? $loc->region_en) : ($loc->region_en ?? $loc->region),
                'city'         => $lang === 'am' ? ($loc->city_am ?? $loc->city_en) : ($loc->city_en ?? $loc->city),
                'distance'     => round($loc->distance, 2),
                'lat'          => $loc->latitude,
                'lng'          => $loc->longitude,
            ];
        })->all();
    }

    private function textResponse(string $text, string $lang): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'type'  => 'text',
            'reply' => $text,
            'lang'  => $lang,
        ]);
    }

    private function errorResponse(string $message, string $lang): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'type'    => 'error',
            'message' => $message,
            'lang'    => $lang,
        ], 422);
    }













    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ChatSession $chatSession)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ChatSession $chatSession)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChatSession $chatSession)
    {
        //
    }
}
