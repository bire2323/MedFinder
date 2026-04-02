<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Drug;
use App\Models\Pharmacy;
use App\Models\PharmacyDrugInventory;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PharmacyDrugInventoryController extends Controller
{
    /**
     * Get inventory with filtering and sorting
     */
    public function getInventory(Request $request)
    {
        $pharmacy = Auth::user()->pharmacy;
        if (!$pharmacy) {
            return response()->json(['success' => false, 'message' => 'Pharmacy not found'], 404);
        }

        $query = $pharmacy->drugs()
            ->withPivot([
                'id',
                'stock',
                'low_stock_threshold',
                'price',
                'cost_price',
                'manufacturer',
                'category',
                'dosage_form',
                'about_drug_en',
                'about_drug_am',
                'prescription_required',
                'expire_date',
                'batch_number',
                'status',
                'is_available'
            ])
            ->whereNull('pharmacy_drug_inventories.deleted_at');

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('brand_name_en', 'like', "%$search%")
                    ->orWhere('generic_name', 'like', "%$search%");
            });
        }

        // Filtering
        if ($request->has('category') && $request->category !== 'all') {
            $query->wherePivot('category', $request->category);
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'low_stock') {
                $query->whereRaw('pharmacy_drug_inventories.stock <= pharmacy_drug_inventories.low_stock_threshold');
            } elseif ($request->status === 'out_of_stock') {
                $query->wherePivot('stock', 0);
            } elseif ($request->status === 'expiring') {
                $query->wherePivot('expire_date', '<=', now()->addDays(30));
            } elseif ($request->status === 'available') {
                $query->wherePivot('is_available', true)->wherePivot('stock', '>', 0);
            }
        }

        $inventory = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $inventory->items(),
            'meta' => [
                'current_page' => $inventory->currentPage(),
                'last_page' => $inventory->lastPage(),
                'total' => $inventory->total(),
            ]
        ]);
    }

    /**
     * Add Drug with Normalization Strategy
     */
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
            'batch_number' => 'nullable|string',
            'rxRequired' => 'boolean',
        ]);

        $pharmacy = Auth::user()->pharmacy;

        Log::info('Add Drug Request', [
            'user_id' => Auth::id(),
            'pharmacy' => $pharmacy?->id,
            'validated_data' => $validated
        ]);

        if (!$pharmacy) {
            return response()->json([
                'message' => 'Pharmacy not found for user'
            ], 404);
        }

        return DB::transaction(function () use ($validated, $pharmacy) {
            // Find existing drug or create new one
            $drug = Drug::where(function ($q) use ($validated) {
                $q->where('brand_name_en', $validated['brand_name_en'])
                    ->where('generic_name', $validated['genericName']);
            })->first();

            if (!$drug) {
                $drug = Drug::create([
                    'generic_name' => $validated['genericName'],
                    'brand_name_en' => $validated['brand_name_en'],
                    'brand_name_am' => $validated['brand_name_am'],
                ]);
                Log::info('New drug created', ['drug_id' => $drug->id]);
            }

            // Check if pharmacy already has this drug (even if soft deleted)
            $existing = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
                ->where('drug_id', $drug->id)
                ->withTrashed()
                ->first();

            $inventory = null;

            if ($existing) {
                Log::info('Updating existing inventory', ['inventory_id' => $existing->id]);

                if ($existing->trashed()) {
                    $existing->restore();
                    Log::info('Restored soft-deleted inventory');
                }

                $existing->update([
                    'stock' => $validated['stock'],
                    'price' => $validated['price'],
                    'cost_price' => $validated['cost_price'] ?? null,
                    'low_stock_threshold' => $validated['low_stock_threshold'] ?? 10,
                    'about_drug_en' => $validated['about_drug_en'],
                    'about_drug_am' => $validated['about_drug_am'] ?? null,
                    'expire_date' => $validated['expire_date'],
                    'manufacturer' => $validated['manufacturer'] ?? null,
                    'category' => $validated['category'] ?? null,
                    'dosage_form' => $validated['dosage_form'] ?? null,
                    'batch_number' => $validated['batch_number'] ?? null,
                    'prescription_required' => $validated['rxRequired'] ?? false,
                    'status' => $validated['stock'] > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
                ]);

                $inventory = $existing;

                Log::info('Inventory updated successfully', [
                    'inventory_id' => $inventory->id,
                    'stock' => $inventory->stock
                ]);
            } else {
                Log::info('Creating new inventory', [
                    'drug_id' => $drug->id,
                    'pharmacy_id' => $pharmacy->id
                ]);

                // Create inventory with explicit attributes
                $inventoryData = [
                    'drug_id' => $drug->id,
                    'pharmacy_id' => $pharmacy->id,
                    'stock' => $validated['stock'],
                    'low_stock_threshold' => $validated['low_stock_threshold'] ?? 10,
                    'price' => $validated['price'],
                    'cost_price' => $validated['cost_price'] ?? null,
                    'about_drug_en' => $validated['about_drug_en'],
                    'about_drug_am' => $validated['about_drug_am'] ?? null,
                    'expire_date' => $validated['expire_date'],
                    'manufacturer' => $validated['manufacturer'] ?? null,
                    'category' => $validated['category'] ?? null,
                    'dosage_form' => $validated['dosage_form'] ?? null,
                    'batch_number' => $validated['batch_number'] ?? null,
                    'prescription_required' => $validated['rxRequired'] ?? false,
                    'status' => $validated['stock'] > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
                ];

                Log::info('Inventory data to create', $inventoryData);

                $inventory = PharmacyDrugInventory::create($inventoryData);

                // Refresh the model to ensure we have the latest data
                $inventory->refresh();

                Log::info('New inventory created', [
                    'inventory_id' => $inventory->id,
                    'inventory_exists' => $inventory->exists,
                    'all_attributes' => $inventory->toArray()
                ]);

                // Double-check that ID exists
                if (!$inventory->id) {
                    Log::error('Inventory created but ID is null!', [
                        'inventory_data' => $inventoryData,
                        'inventory_object' => $inventory
                    ]);
                    throw new \Exception("Inventory created but ID is null");
                }
            }

            // Log stock history
            $oldStock = $existing ? $existing->getOriginal('stock') : 0;

            Log::info('Creating stock history', [
                'inventory_id' => $inventory->id,
                'old_stock' => $oldStock,
                'new_stock' => $validated['stock']
            ]);

            $stockHistory = StockHistory::create([
                'inventory_id' => $inventory->id,
                'old_stock' => $oldStock,
                'new_stock' => $validated['stock'],
                'change_amount' => $validated['stock'] - $oldStock,
                'type' => 'MANUAL',
                'reason' => $existing ? 'Stock updated' : 'Initial stock addition',
                'performed_by' => Auth::id()
            ]);

            Log::info('Stock history created', ['stock_history_id' => $stockHistory->id]);

            return response()->json([
                'success' => true,
                'data' => $inventory,
                'message' => $existing ? 'Drug inventory updated successfully' : 'Drug added successfully'
            ]);
        });
    }

    /**
     * Update Inventory item
     */
    public function update($id, Request $request)
    {
        $validated = $request->validate([
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
            'is_available' => 'boolean',
        ]);

        $pharmacy = Auth::user()->pharmacy;
        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $oldStock = $inventory->stock;

        $inventory->update([
            'about_drug_en' => $validated['about_drug_en'],
            'about_drug_am' => $validated['about_drug_am'] ?? $inventory->about_drug_am,
            'stock' => $validated['stock'],
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? $inventory->low_stock_threshold,
            'price' => $validated['price'],
            'cost_price' => $validated['cost_price'] ?? $inventory->cost_price,
            'expire_date' => $validated['expire_date'],
            'prescription_required' => $validated['prescription_required'] ?? $inventory->prescription_required,
            'manufacturer' => $validated['manufacturer'] ?? $inventory->manufacturer,
            'category' => $validated['category'] ?? $inventory->category,
            'dosage_form' => $validated['dosage_form'] ?? $inventory->dosage_form,
            'batch_number' => $validated['batch_number'] ?? $inventory->batch_number,
            'is_available' => $validated['is_available'] ?? $inventory->is_available,
            'status' => $validated['stock'] > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
        ]);

        // Log history only if stock changed
        if ($oldStock != $validated['stock']) {
            StockHistory::create([
                'inventory_id' => $inventory->id,
                'old_stock' => $oldStock,
                'new_stock' => $validated['stock'],
                'change_amount' => $validated['stock'] - $oldStock,
                'type' => 'MANUAL',
                'reason' => 'Inventory update',
                'performed_by' => Auth::id()
            ]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Soft Delete Inventory item
     */
    public function deleteDrug($id)
    {
        $pharmacy = Auth::user()->pharmacy;

        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $inventory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item archived successfully',
        ]);
    }

    /**
     * Get Inventory Analytics
     */
    public function getAnalytics()
    {
        $pharmacy = Auth::user()->pharmacy;
        if (!$pharmacy) return response()->json(['success' => false], 404);

        $totalItems = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)->count();
        $lowStock = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->whereRaw('stock <= low_stock_threshold')
            ->count();
        $outOfStock = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->where('stock', 0)
            ->count();
        $expiringSoon = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->where('expire_date', '<=', now()->addMonths(3))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_items' => $totalItems,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock,
                'expiring_soon' => $expiringSoon,
            ]
        ]);
    }

    /**
     * Get Archived Items (Trash)
     */
    public function getTrash()
    {
        $pharmacy = Auth::user()->pharmacy;
        Log::info("pha trash", ['pharmacy' => $pharmacy]);
        $trashed = PharmacyDrugInventory::onlyTrashed()
            ->where('pharmacy_id', $pharmacy->id)
            ->with('drug')
            ->get();
        Log::info("pha trash", ['trashed' => $trashed]);
        return response()->json(['success' => true, 'data' => $trashed]);
    }

    /**
     * Restore Archived Item
     */
    public function restoreDrug($id)
    {
        $pharmacy = Auth::user()->pharmacy;
        PharmacyDrugInventory::onlyTrashed()
            ->where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail()
            ->restore();

        return response()->json(['success' => true, 'message' => 'Item restored successfully']);
    }

    /**
     * Toggle Availability
     */
    public function toggleAvailability($id)
    {
        $pharmacy = Auth::user()->pharmacy;
        $inventory = PharmacyDrugInventory::where('id', $id)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $inventory->is_available = !$inventory->is_available;
        $inventory->save();

        return response()->json(['success' => true, 'is_available' => $inventory->is_available]);
    }

    /**
     * Get Stock History
     */
    public function getStockHistory(Request $request)
    {
        $pharmacy = Auth::user()->pharmacy;

        if (!$pharmacy) {

            return response()->json(['success' => false, 'message' => 'Pharmacy not found'], 404);
        }

        $query = StockHistory::whereHas('inventory', function ($q) use ($pharmacy) {
            $q->where('pharmacy_id', $pharmacy->id);
        })
            ->with(['inventory.drug'])
            ->orderBy('created_at', 'desc');
        //performer

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $history = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $history->items(),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'total' => $history->total(),
            ]
        ]);
    }
}
