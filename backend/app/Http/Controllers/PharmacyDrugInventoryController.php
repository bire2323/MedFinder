<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\Pharmacy;
use App\Models\PharmacyDrugInventory;
use App\Models\StockHistory;
use App\Repositories\InventoryRepository;
use App\Services\StockAlertService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PharmacyDrugInventoryController extends Controller
{
    public function __construct(
        protected InventoryRepository $inventory,
        protected StockAlertService $alerts
    ) {}

    protected function pharmacy()
    {
        $pharmacy = Auth::user()->pharmacy;
        if (!$pharmacy) {
            return null;
        }

        return $pharmacy;
    }

    public function getInventory(Request $request)
    {
        $pharmacy = $this->pharmacy();
        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found'], 404);
        }

        $query = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->with('drug')
            ->whereNull('deleted_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('drug', function ($q) use ($search) {
                $q->where('brand_name_en', 'like', "%{$search}%")
                    ->orWhere('generic_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'low_stock') {
                $query->whereRaw('stock <= low_stock_threshold');
            } elseif ($request->status === 'out_of_stock') {
                $query->where('stock', 0);
            } elseif ($request->status === 'available') {
                $query->where('is_available', true)->where('stock', '>', 0);
            } elseif (in_array($request->status, ['expiring', 'expiring_3m', 'expiring_6m'], true)) {
                $days = match ($request->status) {
                    'expiring_3m' => 90,
                    'expiring_6m' => 180,
                    default => 30,
                };
                $drugIds = $this->inventory->getDrugIdsExpiringWithin($pharmacy, $days);
                if (empty($drugIds)) {
                    $query->whereRaw('1 = 0');
                } else {
                    $query->whereIn('drug_id', $drugIds);
                }
            }
        }

        $paginated = $query->paginate($request->get('per_page', 10));

        $data = collect($paginated->items())->map(function ($item) use ($pharmacy) {
            $drugModel = $item->drug;
            $batches = $drugModel
                ? $this->inventory->getBatchesInFifoOrder($pharmacy, $drugModel)
                : collect();

            $pivot = $item->toArray();

            return [
                'id' => $drugModel?->id,
                'generic_name' => $drugModel?->generic_name,
                'brand_name_en' => $drugModel?->brand_name_en,
                'brand_name_am' => $drugModel?->brand_name_am,
                'drug' => $drugModel,
                'pivot' => $pivot,
                'inventory' => $pivot,
                'total_stock' => $item->stock,
                'batches' => $batches->map(fn ($b) => $this->inventory->formatBatchForApi($b)),
                'batch_count' => $batches->count(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function searchMedicine(Request $request)
    {
        $searchTerm = $request->query('query');

        if (empty($searchTerm)) {
            return response()->json(['message' => 'Missing search query'], 400);
        }

        $medicines = Drug::where('brand_name_en', 'LIKE', "%{$searchTerm}%")
            ->orWhere('generic_name', 'LIKE', "%{$searchTerm}%")
            ->orWhere('brand_name_am', 'LIKE', "%{$searchTerm}%")
            ->get();

        if ($medicines->isEmpty()) {
            return response()->json([]);
        }

        $medicineIds = $medicines->pluck('id');

        $pharmacies = Pharmacy::whereHas('drugInventories', function ($query) use ($medicineIds) {
            $query->whereIn('drug_id', $medicineIds)->where('stock', '>', 0);
        })
            ->where('status', 'APPROVED')
            ->with(['addresses', 'drugInventories' => function ($query) use ($medicineIds) {
                $query->whereIn('drug_id', $medicineIds)->with('drug');
            }])
            ->get();

        $result = [];

        foreach ($pharmacies as $pharmacy) {
            $pArray = $pharmacy->toArray();
            $pArray['type'] = 'pharmacy';
            $pArray['global_id'] = 'p-' . $pharmacy->id;

            foreach ($pharmacy->drugInventories as $inventory) {
                $item = $pArray;
                $item['drugPrice'] = $inventory->price;
                $item['expire_date'] = $inventory->expire_date;
                $item['drugAvailability'] = $inventory->stock > 0 ? 'available' : 'not_available';
                $item['drugName'] = $inventory->drug?->generic_name;
                $item['total_stock'] = $inventory->stock;
                $item['batches'] = $inventory->drug
                    ? $this->inventory->getBatchesInFifoOrder($pharmacy, $inventory->drug)
                        ->map(fn ($b) => $this->inventory->formatBatchForApi($b))
                    : [];
                $result[] = $item;
            }
        }

        return response()->json($result);
    }

    public function getInventoryMetadata(Request $request)
    {
        $pharmacy = $this->pharmacy();
        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found'], 404);
        }

        $type = $request->query('type', 'category');
        $query = $request->query('query', '');

        if ($type === 'brand') {
            $results = Drug::whereNotNull('brand_name_en')
                ->where('brand_name_en', '<>', '')
                ->when($query, fn ($q) => $q->where('brand_name_en', 'like', "%{$query}%"))
                ->distinct()
                ->pluck('brand_name_en');

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        }

        if ($type === 'brand_am') {
            $results = Drug::whereNotNull('brand_name_am')
                ->where('brand_name_am', '<>', '')
                ->when($query, fn ($q) => $q->where('brand_name_am', 'like', "%{$query}%"))
                ->distinct()
                ->pluck('brand_name_am');

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        }

        if ($type === 'generic') {
            $results = Drug::whereNotNull('generic_name')
                ->where('generic_name', '<>', '')
                ->when($query, fn ($q) => $q->where('generic_name', 'like', "%{$query}%"))
                ->distinct()
                ->pluck('generic_name');

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        }

        if ($type === 'all') {
            $brandNamesEn = Drug::whereNotNull('brand_name_en')
                ->where('brand_name_en', '<>', '')
                ->distinct()
                ->pluck('brand_name_en');

            $brandNamesAm = Drug::whereNotNull('brand_name_am')
                ->where('brand_name_am', '<>', '')
                ->distinct()
                ->pluck('brand_name_am');

            $genericNames = Drug::whereNotNull('generic_name')
                ->where('generic_name', '<>', '')
                ->distinct()
                ->pluck('generic_name');

            $inventoryCategories = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
                ->whereNotNull('category')
                ->where('category', '<>', '')
                ->distinct()
                ->pluck('category');

            $batchCategories = DrugBatch::whereNotNull('category')
                ->where('category', '<>', '')
                ->distinct()
                ->pluck('category');

            $categories = $inventoryCategories->merge($batchCategories)->unique()->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'brand_names_en' => $brandNamesEn,
                    'brand_names_am' => $brandNamesAm,
                    'generic_names' => $genericNames,
                    'categories' => $categories,
                ],
            ]);
        }

        $inventoryCategories = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->whereNotNull('category')
            ->where('category', '<>', '')
            ->when($query, fn ($q) => $q->where('category', 'like', "%{$query}%"))
            ->distinct()
            ->pluck('category');

        $batchCategories = DrugBatch::whereNotNull('category')
            ->where('category', '<>', '')
            ->when($query, fn ($q) => $q->where('category', 'like', "%{$query}%"))
            ->distinct()
            ->pluck('category');

        $results = $inventoryCategories->merge($batchCategories)->unique()->values();

        return response()->json([
            'success' => true,
            'data' => $results,
        ]);
    }

    public function botSearchMedicine(Request $request)
    {
        $searchTerm = $request->query('name');

        if (empty($searchTerm)) {
            return response()->json(['message' => 'Missing search query'], 400);
        }

        $medicines = Drug::where('brand_name_en', 'LIKE', "%{$searchTerm}%")
            ->orWhere('generic_name', 'LIKE', "%{$searchTerm}%")
            ->orWhere('brand_name_am', 'LIKE', "%{$searchTerm}%")
            ->pluck('id');

        if ($medicines->isEmpty()) {
            return response()->json(['opps' => 'opps']);
        }

        $pharmacies = Pharmacy::whereHas('drugInventories', function ($query) use ($medicines) {
            $query->whereIn('drug_id', $medicines)->where('stock', '>', 0);
        })
            ->where('status', 'APPROVED')
            ->with([
                'addresses:id,addressable_id,region_en,sub_city_en',
                'drugInventories' => fn ($q) => $q->whereIn('drug_id', $medicines)->with('drug'),
            ])
            ->get();

        $result = [];

        foreach ($pharmacies as $pharmacy) {
            $address = $pharmacy->addresses->first();

            foreach ($pharmacy->drugInventories as $inventory) {
                if ($inventory->stock <= 0) {
                    continue;
                }

                $nearestBatch = $inventory->drug
                    ? $this->inventory->getBatchesInFifoOrder($pharmacy, $inventory->drug)->first()
                    : null;

                $result[] = [
                    'pharmacy' => $pharmacy->pharmacy_name_en,
                    'location' => ($address->sub_city_en ?? '') . ', ' . ($address->region_en ?? ''),
                    'drug' => $inventory->drug?->generic_name,
                    'price' => (float) $inventory->price,
                    'stock' => (int) $inventory->stock,
                    'availability' => 'available',
                    'requires_prescription' => (bool) $inventory->prescription_required,
                    'expiry' => optional($inventory->expire_date)->format('Y-m-d'),
                    'batch_number' => $nearestBatch?->drugBatch?->batch_number,
                ];
            }
        }

        usort($result, fn ($a, $b) => $a['price'] <=> $b['price']);

        return response()->json($result);
    }

    public function addDrug(Request $request)
    {
        $validated = $request->validate([
            'brand_name_en' => 'required|string|max:255',
            'brand_name_am' => 'nullable|string|max:255',
            'genericName' => 'required|string|max:255',
            'about_drug_en' => 'required|string',
            'about_drug_am' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'category' => 'nullable|string',
            'dosage_form' => 'nullable|string',
            'expire_date' => 'required|date',
            'manufacture_date' => 'nullable|date',
            'batch_number' => 'nullable|string',
            'rxRequired' => 'boolean',
        ]);

        $pharmacy = $this->pharmacy();
        if (!$pharmacy) {
            return response()->json(['message' => 'Pharmacy not found for user'], 404);
        }

        return DB::transaction(function () use ($validated, $pharmacy) {
            $drug = Drug::firstOrCreate(
                [
                    'brand_name_en' => $validated['brand_name_en'],
                    'generic_name' => $validated['genericName'],
                ],
                [
                    'brand_name_am' => $validated['brand_name_am'] ?? null,
                ]
            );

            if (!empty($validated['brand_name_am']) && $drug->brand_name_am !== $validated['brand_name_am']) {
                $drug->update(['brand_name_am' => $validated['brand_name_am']]);
            }

            $batchNumber = $validated['batch_number'] ?: 'BATCH-' . now()->format('YmdHis');

            $batch = $this->inventory->findOrCreateBatch($drug, [
                'batch_number' => $batchNumber,
                'manufacture_date' => $validated['manufacture_date'] ?? null,
                'expiration_date' => $validated['expire_date'],
                'manufacturer' => $validated['manufacturer'] ?? null,
                'category' => $validated['category'] ?? null,
                'dosage_form' => $validated['dosage_form'] ?? null,
            ]);

            $summary = $this->inventory->ensureSummaryInventory($pharmacy, $drug->id, [
                'about_drug_en' => $validated['about_drug_en'],
                'about_drug_am' => $validated['about_drug_am'] ?? null,
                'low_stock_threshold' => $validated['low_stock_threshold'] ?? 10,
                'prescription_required' => $validated['rxRequired'] ?? false,
                'manufacturer' => $validated['manufacturer'] ?? null,
                'category' => $validated['category'] ?? null,
                'dosage_form' => $validated['dosage_form'] ?? null,
                'expire_date' => $validated['expire_date'],
                'price' => $validated['price'],
                'cost_price' => $validated['cost_price'] ?? null,
                'is_available' => true,
            ]);

            $summary->update([
                'about_drug_en' => $validated['about_drug_en'],
                'about_drug_am' => $validated['about_drug_am'] ?? $summary->about_drug_am,
                'low_stock_threshold' => $validated['low_stock_threshold'] ?? $summary->low_stock_threshold,
                'prescription_required' => $validated['rxRequired'] ?? false,
            ]);

            $batchInventory = $this->inventory->addStockFromReceipt(
                $pharmacy,
                $batch,
                $validated['stock'],
                (float) ($validated['cost_price'] ?? 0),
                (float) $validated['price'],
                Auth::user()
            );

            $summary = $this->inventory->syncSummaryInventory($pharmacy, $drug);

            $this->alerts->evaluateBatchLowStock($batchInventory);

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => $summary,
                    'batch' => $this->inventory->formatBatchForApi($batchInventory),
                    'batches' => $this->inventory->getBatchesInFifoOrder($pharmacy, $drug)
                        ->map(fn ($b) => $this->inventory->formatBatchForApi($b)),
                ],
                'message' => 'Drug batch added successfully',
            ]);
        });
    }

    public function update($id, Request $request)
    {
        $validated = $request->validate([
            'brand_name_en' => 'required|string|max:255',
            'brand_name_am' => 'nullable|string|max:255',
            'genericName' => 'required|string|max:255',
            'about_drug_en' => 'required|string',
            'about_drug_am' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'expire_date' => 'required|date',
            'prescription_required' => 'boolean',
            'manufacturer' => 'nullable|string',
            'category' => 'nullable|string',
            'dosage_form' => 'nullable|string',
            'batch_number' => 'nullable|string',
            'batch_inventory_id' => 'nullable|exists:pharmacy_batch_inventories,id',
            'is_available' => 'boolean',
        ]);

        $pharmacy = $this->pharmacy();
        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->with('drug')
            ->firstOrFail();

        return DB::transaction(function () use ($validated, $pharmacy, $inventory) {
            $inventory->update([
                'about_drug_en' => $validated['about_drug_en'],
                'about_drug_am' => $validated['about_drug_am'] ?? $inventory->about_drug_am,
                'low_stock_threshold' => $validated['low_stock_threshold'] ?? $inventory->low_stock_threshold,
                'prescription_required' => $validated['prescription_required'] ?? $inventory->prescription_required,
                'manufacturer' => $validated['manufacturer'] ?? $inventory->manufacturer,
                'category' => $validated['category'] ?? $inventory->category,
                'dosage_form' => $validated['dosage_form'] ?? $inventory->dosage_form,
                'is_available' => $validated['is_available'] ?? $inventory->is_available,
            ]);

            if (!empty($validated['batch_inventory_id'])) {
                $batchInventory = \App\Models\PharmacyBatchInventory::where('id', $validated['batch_inventory_id'])
                    ->where('pharmacy_id', $pharmacy->id)
                    ->firstOrFail();

                $oldQty = $batchInventory->quantity_available;
                $diff = $validated['stock'] - $oldQty;

                $batchInventory->update([
                    'quantity_available' => $validated['stock'],
                    'unit_selling_price' => $validated['price'],
                    'unit_cost_price' => $validated['cost_price'] ?? $batchInventory->unit_cost_price,
                ]);

                if ($batchInventory->drugBatch) {
                    $batchInventory->drugBatch->update([
                        'expiration_date' => $validated['expire_date'],
                        'batch_number' => $validated['batch_number'] ?? $batchInventory->drugBatch->batch_number,
                        'manufacturer' => $validated['manufacturer'] ?? $batchInventory->drugBatch->manufacturer,
                        'category' => $validated['category'] ?? $batchInventory->drugBatch->category,
                        'dosage_form' => $validated['dosage_form'] ?? $batchInventory->drugBatch->dosage_form,
                    ]);
                }

                if ($diff !== 0) {
                    StockHistory::create([
                        'inventory_id' => $inventory->id,
                        'pharmacy_batch_inventory_id' => $batchInventory->id,
                        'drug_batch_id' => $batchInventory->drug_batch_id,
                        'old_stock' => $oldQty,
                        'new_stock' => $validated['stock'],
                        'old_quantity' => $oldQty,
                        'new_quantity' => $validated['stock'],
                        'change_amount' => $diff,
                        'type' => 'ADJUSTMENT',
                        'reason' => 'Batch inventory update',
                        'performed_by' => Auth::id(),
                    ]);
                }
            }

            if ($inventory->drug) {
                $inventory->drug->update([
                    'brand_name_en' => $validated['brand_name_en'] ?? $inventory->drug->brand_name_en,
                    'brand_name_am' => $validated['brand_name_am'] ?? $inventory->drug->brand_name_am,
                    'generic_name' => $validated['genericName'] ?? $inventory->drug->generic_name,
                ]);
            }

            $inventory = $this->inventory->syncSummaryInventory($pharmacy, $inventory->drug);

            if (!empty($validated['batch_inventory_id'])) {
                $updatedBatch = \App\Models\PharmacyBatchInventory::find($validated['batch_inventory_id']);
                if ($updatedBatch) {
                    $this->alerts->evaluateBatchLowStock($updatedBatch);
                }
            }

            return response()->json([
                'success' => true,
                'data' => $inventory->load('drug'),
            ]);
        });
    }

    public function deleteDrug($id)
    {
        $pharmacy = $this->pharmacy();

        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $inventory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item archived successfully',
        ]);
    }

    public function getAnalytics()
    {
        $pharmacy = $this->pharmacy();
        if (!$pharmacy) {
            return response()->json(['success' => false], 200);
        }

        $totalItems = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)->count();
        $drugs = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)->with('drug')->get();

        $lowStock = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->whereRaw('stock <= low_stock_threshold')
            ->count();

        $lowStockItems = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->whereRaw('stock <= low_stock_threshold')
            ->with('drug')
            ->get();

        $outOfStock = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->where('stock', 0)
            ->count();

        $outOfStockItems = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->where('stock', 0)
            ->with('drug')
            ->get();

        $expiringSoon = $this->inventory->getExpiringBatches($pharmacy, 90)->count();
        $expiringSoonItems = $this->inventory->getExpiringBatches($pharmacy, 90)
            ->map(fn ($b) => $this->inventory->formatBatchForApi($b));

        $userSession = ChatSession::where('pharmacy_id', $pharmacy->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_items' => $totalItems,
                'drugs' => $drugs,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
                'low_stock_items' => $lowStockItems,
                'out_of_stock_items' => $outOfStockItems,
                'expiring_soon' => $expiringSoon,
                'expiring_soon_items' => $expiringSoonItems,
                'user_sessions' => $userSession,
            ],
        ]);
    }

    public function getTrash()
    {
        $pharmacy = $this->pharmacy();
        $trashed = PharmacyDrugInventory::onlyTrashed()
            ->where('pharmacy_id', $pharmacy->id)
            ->with('drug')
            ->get();

        return response()->json(['success' => true, 'data' => $trashed]);
    }

    public function restoreDrug($id)
    {
        $pharmacy = $this->pharmacy();
        PharmacyDrugInventory::onlyTrashed()
            ->where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail()
            ->restore();

        return response()->json(['success' => true, 'message' => 'Item restored successfully']);
    }

    public function toggleAvailability($id)
    {
        $pharmacy = $this->pharmacy();
        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $inventory->is_available = !$inventory->is_available;
        $inventory->save();

        return response()->json(['success' => true, 'is_available' => $inventory->is_available]);
    }

    public function getStockHistory(Request $request)
    {
        $pharmacy = $this->pharmacy();

        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found'], 404);
        }

        $query = StockHistory::where(function ($q) use ($pharmacy) {
            $q->whereHas('inventory', fn ($inv) => $inv->where('pharmacy_id', $pharmacy->id))
                ->orWhereHas('pharmacyBatchInventory', fn ($inv) => $inv->where('pharmacy_id', $pharmacy->id));
        })
            ->with(['inventory.drug', 'drugBatch.drug', 'pharmacyBatchInventory', 'performedBy'])
            ->orderByDesc('created_at');

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('inventory.drug', function ($q) use ($search) {
                    $q->where('brand_name_en', 'like', "%{$search}%")
                        ->orWhere('generic_name', 'like', "%{$search}%")
                        ->orWhere('brand_name_am', 'like', "%{$search}%");
                })
                ->orWhereHas('drugBatch', function ($q) use ($search) {
                    $q->where('batch_number', 'like', "%{$search}%");
                })
                ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($request->date_from)->toDateTimeString());
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($request->date_to)->toDateTimeString());
        }

        $history = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $history->items(),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'total' => $history->total(),
            ],
        ]);
    }
}
