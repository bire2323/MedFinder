<?php

namespace App\Http\Controllers;

use App\Models\Drug;
use App\Models\LowStockExpirationAlert;
use App\Models\PharmacyBatchInventory;
use App\Repositories\InventoryRepository;
use App\Services\StockAlertService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BatchInventoryController extends Controller
{
    public function __construct(
        protected InventoryRepository $inventory,
        protected StockAlertService $alerts
    ) {}

    protected function pharmacy()
    {
        $pharmacy = Auth::user()->pharmacy;
        if (!$pharmacy) {
            abort(404, 'Pharmacy not found');
        }

        return $pharmacy;
    }

    public function index(Request $request, int $drugId)
    {
        $pharmacy = $this->pharmacy();
        $drug = Drug::findOrFail($drugId);

        $batches = $this->inventory->getBatchesInFifoOrder($pharmacy, $drug);

        return response()->json([
            'success' => true,
            'data' => [
                'drug_id' => $drug->id,
                'generic_name' => $drug->generic_name,
                'brand_name_en' => $drug->brand_name_en,
                'total_stock' => $this->inventory->getTotalStock($pharmacy, $drug),
                'average_price' => $this->inventory->getAverageSellingPrice($pharmacy, $drug),
                'batches' => $batches->map(fn ($b) => $this->inventory->formatBatchForApi($b)),
            ],
        ]);
    }

    public function expiring(Request $request)
    {
        $pharmacy = $this->pharmacy();
        $days = (int) $request->get('days', 90);

        $batches = $this->inventory->getExpiringBatches($pharmacy, $days);

        return response()->json([
            'success' => true,
            'data' => $batches->map(fn ($b) => $this->inventory->formatBatchForApi($b)),
        ]);
    }

    public function lowStock()
    {
        $pharmacy = $this->pharmacy();
        $batches = $this->inventory->getLowStockBatches($pharmacy);

        return response()->json([
            'success' => true,
            'data' => $batches->map(fn ($b) => $this->inventory->formatBatchForApi($b)),
        ]);
    }

    public function history(Request $request, int $drugId)
    {
        $pharmacy = $this->pharmacy();
        $drug = Drug::findOrFail($drugId);
        $days = (int) $request->get('days', 30);

        $history = $this->inventory->getStockHistory($pharmacy, $drug, $days);

        return response()->json(['success' => true, 'data' => $history]);
    }

    public function dispense(Request $request)
    {
        $validated = $request->validate([
            'drug_id' => 'required|exists:drugs,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ]);

        $pharmacy = $this->pharmacy();
        $drug = Drug::findOrFail($validated['drug_id']);

        $success = $this->inventory->dispenseFifo(
            $pharmacy,
            $drug,
            $validated['quantity'],
            Auth::user(),
            $validated['reason'] ?? 'FIFO dispense'
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock available',
            ], 400);
        }

        $this->alerts->checkAndCreateAlerts($pharmacy);

        return response()->json([
            'success' => true,
            'message' => 'Stock dispensed using FIFO',
            'total_stock' => $this->inventory->getTotalStock($pharmacy, $drug),
        ]);
    }

    public function adjustBatch(Request $request, int $batchInventoryId)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|integer|not_in:0',
            'reason' => 'nullable|string|max:500',
            'low_stock_threshold' => 'nullable|integer|min:0',
        ]);

        $pharmacy = $this->pharmacy();

        $batchInventory = PharmacyBatchInventory::where('id', $batchInventoryId)
            ->where('pharmacy_id', $pharmacy->id)
            ->with('drugBatch.drug')
            ->firstOrFail();

        if (isset($validated['low_stock_threshold'])) {
            $batchInventory->update(['low_stock_threshold' => $validated['low_stock_threshold']]);
        }

        $change = (int) $validated['quantity_change'];
        if ($change < 0 && $batchInventory->quantity_available < abs($change)) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove more than available stock for this batch',
            ], 400);
        }

        $updated = $this->inventory->adjustBatchQuantity(
            $batchInventory,
            $change,
            Auth::user(),
            $validated['reason'] ?? null
        );

        $this->alerts->evaluateBatchLowStock($updated);

        return response()->json([
            'success' => true,
            'message' => $change > 0 ? 'Stock added to batch' : 'Stock removed from batch',
            'data' => $this->inventory->formatBatchForApi($updated),
        ]);
    }

    public function updateBatch(Request $request, int $batchInventoryId)
    {
        $validated = $request->validate([
            'quantity_available' => 'sometimes|integer|min:0',
            'unit_selling_price' => 'sometimes|numeric|min:0',
            'unit_cost_price' => 'nullable|numeric|min:0',
            'storage_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:ACTIVE,BLOCKED,EXPIRED,DAMAGED,ARCHIVED',
        ]);

        $pharmacy = $this->pharmacy();

        $batchInventory = PharmacyBatchInventory::where('id', $batchInventoryId)
            ->where('pharmacy_id', $pharmacy->id)
            ->with('drugBatch.drug')
            ->firstOrFail();

        $batchInventory->update($validated);

        if ($batchInventory->drugBatch?->drug) {
            $this->inventory->syncSummaryInventory($pharmacy, $batchInventory->drugBatch->drug);
        }

        return response()->json([
            'success' => true,
            'data' => $this->inventory->formatBatchForApi($batchInventory->fresh('drugBatch')),
        ]);
    }

    public function alerts(Request $request)
    {
        $pharmacy = $this->pharmacy();

        $query = LowStockExpirationAlert::where('pharmacy_id', $pharmacy->id)
            ->with(['drug', 'drugBatch'])
            ->orderByRaw("FIELD(severity, 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW')")
            ->orderByDesc('alert_triggered_at');

        if ($request->filled('status')) {
            $query->where('alert_status', $request->status);
        } else {
            $query->whereIn('alert_status', ['PENDING', 'NOTIFIED', 'ACKNOWLEDGED']);
        }

        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function acknowledgeAlert(int $alertId)
    {
        $pharmacy = $this->pharmacy();

        $alert = LowStockExpirationAlert::where('id', $alertId)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $alert->update([
            'alert_status' => 'ACKNOWLEDGED',
            'acknowledged_by' => Auth::id(),
        ]);

        return response()->json(['success' => true, 'data' => $alert]);
    }

    public function resolveAlert(int $alertId)
    {
        $pharmacy = $this->pharmacy();

        $alert = LowStockExpirationAlert::where('id', $alertId)
            ->where('pharmacy_id', $pharmacy->id)
            ->firstOrFail();

        $alert->update([
            'alert_status' => 'RESOLVED',
            'resolved_at' => now(),
            'acknowledged_by' => Auth::id(),
        ]);

        return response()->json(['success' => true, 'data' => $alert]);
    }

    public function runAlertCheck()
    {
        $pharmacy = $this->pharmacy();
        $this->alerts->checkAndCreateAlerts($pharmacy);

        return response()->json(['success' => true, 'message' => 'Alert check completed']);
    }
}
