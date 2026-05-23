<?php

namespace App\Repositories;

use App\Models\Drug;
use App\Models\DrugBatch;
use App\Models\Pharmacy;
use App\Models\PharmacyBatchInventory;
use App\Models\PharmacyDrugInventory;
use App\Models\StockHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class InventoryRepository
{
    public function getTotalStock(Pharmacy $pharmacy, Drug $drug): int
    {
        return (int) PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drug->id))
            ->where('status', 'ACTIVE')
            ->sum('quantity_available');
    }

    public function getBatchesInFifoOrder(Pharmacy $pharmacy, Drug $drug): Collection
    {
        return PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drug->id))
            ->where('status', 'ACTIVE')
            ->with('drugBatch')
            ->orderBy('fifo_order')
            ->orderBy('received_at')
            ->get();
    }

    public function getExpiringBatches(Pharmacy $pharmacy, int $daysUntilExpiry = 90): Collection
    {
        $expiryDate = now()->addDays($daysUntilExpiry);

        return PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->where('status', 'ACTIVE')
            ->whereHas('drugBatch', function ($query) use ($expiryDate) {
                $query->whereBetween('expiration_date', [
                    now()->toDateString(),
                    $expiryDate->toDateString(),
                ]);
            })
            ->with(['drugBatch', 'drugBatch.drug'])
            ->get()
            ->sortBy(fn ($item) => $item->drugBatch?->expiration_date);
    }

    public function getLowStockBatches(Pharmacy $pharmacy, ?int $threshold = null): Collection
    {
        return PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->where('status', 'ACTIVE')
            ->with(['drugBatch', 'drugBatch.drug'])
            ->get()
            ->filter(function ($batch) use ($threshold) {
                $limit = $threshold ?? $batch->resolveLowStockThreshold();

                return $batch->quantity_available <= $limit;
            })
            ->values();
    }

    public function getDrugIdsExpiringWithin(Pharmacy $pharmacy, int $days): array
    {
        $start = now()->toDateString();
        $end = now()->addDays($days)->toDateString();

        $fromBatches = PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->where('status', 'ACTIVE')
            ->whereHas('drugBatch', fn ($q) => $q->whereBetween('expiration_date', [$start, $end]))
            ->with('drugBatch:id,drug_id')
            ->get()
            ->pluck('drugBatch.drug_id')
            ->filter();

        $fromSummary = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
            ->whereBetween('expire_date', [$start, $end])
            ->pluck('drug_id');

        return $fromBatches->merge($fromSummary)->unique()->values()->all();
    }

    public function adjustBatchQuantity(
        PharmacyBatchInventory $batchInventory,
        int $quantityChange,
        User $performedBy,
        ?string $reason = null
    ): PharmacyBatchInventory {
        if ($quantityChange === 0) {
            return $batchInventory;
        }

        $batchInventory->load('drugBatch.drug');
        $oldQuantity = $batchInventory->quantity_available;
        $newQuantity = max(0, $oldQuantity + $quantityChange);

        if ($quantityChange > 0) {
            $batchInventory->increment('quantity_received', $quantityChange);
        }

        $batchInventory->update(['quantity_available' => $newQuantity]);

        $summaryId = null;
        if ($batchInventory->drugBatch?->drug) {
            $pharmacy = Pharmacy::find($batchInventory->pharmacy_id);
            if ($pharmacy) {
                $summaryId = $this->ensureSummaryInventory($pharmacy, $batchInventory->drugBatch->drug_id)->id;
                $this->syncSummaryInventory($pharmacy, $batchInventory->drugBatch->drug);
            }
        }

        StockHistory::create([
            'inventory_id' => $summaryId,
            'pharmacy_batch_inventory_id' => $batchInventory->id,
            'drug_batch_id' => $batchInventory->drug_batch_id,
            'old_stock' => $oldQuantity,
            'new_stock' => $newQuantity,
            'old_quantity' => $oldQuantity,
            'new_quantity' => $newQuantity,
            'change_amount' => $quantityChange,
            'type' => 'ADJUSTMENT',
            'reason' => $reason ?? ($quantityChange > 0 ? 'Stock added' : 'Stock removed'),
            'performed_by' => $performedBy->id,
            'ip_address' => request()?->ip(),
        ]);

        return $batchInventory->fresh(['drugBatch', 'drugBatch.drug']);
    }

    public function dispenseFifo(
        Pharmacy $pharmacy,
        Drug $drug,
        int $quantity,
        User $performedBy,
        ?string $reason = null
    ): bool {
        $batches = $this->getBatchesInFifoOrder($pharmacy, $drug);
        $remaining = $quantity;

        foreach ($batches as $batch) {
            if ($remaining <= 0) {
                break;
            }

            if (!$batch->canDispense()) {
                continue;
            }

            $dispensable = min($remaining, $batch->quantity_available);
            $batch->deduct($dispensable, $reason, $performedBy);
            $remaining -= $dispensable;
        }

        if ($remaining <= 0) {
            $this->syncSummaryInventory($pharmacy, $drug);
            return true;
        }

        return false;
    }

    public function addStockFromReceipt(
        Pharmacy $pharmacy,
        DrugBatch $batch,
        int $quantity,
        float $costPrice,
        float $sellingPrice,
        User $performedBy,
        ?string $referenceType = null,
        ?int $referenceId = null
    ): PharmacyBatchInventory {
        $inventory = PharmacyBatchInventory::firstOrNew([
            'pharmacy_id' => $pharmacy->id,
            'drug_batch_id' => $batch->id,
        ]);

        $isNew = !$inventory->exists;
        $oldQuantity = $inventory->quantity_available ?? 0;

        if ($isNew) {
            $summaryThreshold = PharmacyDrugInventory::where('pharmacy_id', $pharmacy->id)
                ->where('drug_id', $batch->drug_id)
                ->value('low_stock_threshold');

            $inventory->fill([
                'quantity_received' => 0,
                'quantity_available' => 0,
                'quantity_reserved' => 0,
                'quantity_dispensed' => 0,
                'quantity_expired' => 0,
                'quantity_damaged' => 0,
                'low_stock_threshold' => $summaryThreshold ?? 10,
                'unit_cost_price' => $costPrice,
                'unit_selling_price' => $sellingPrice,
                'fifo_order' => $this->getNextFifoOrder($pharmacy, $batch->drug),
                'received_at' => now(),
                'status' => 'ACTIVE',
            ]);
        }

        $inventory->quantity_received = ($inventory->quantity_received ?? 0) + $quantity;
        $inventory->quantity_available = ($inventory->quantity_available ?? 0) + $quantity;
        $inventory->unit_cost_price = $costPrice;
        $inventory->unit_selling_price = $sellingPrice;
        $inventory->save();

        $summary = $this->ensureSummaryInventory($pharmacy, $batch->drug_id, [
            'price' => $sellingPrice,
            'cost_price' => $costPrice,
        ]);

        StockHistory::create([
            'inventory_id' => $summary->id,
            'pharmacy_batch_inventory_id' => $inventory->id,
            'drug_batch_id' => $batch->id,
            'old_stock' => $oldQuantity,
            'new_stock' => $inventory->quantity_available,
            'old_quantity' => $oldQuantity,
            'new_quantity' => $inventory->quantity_available,
            'change_amount' => $quantity,
            'type' => 'ADJUSTMENT',
            'reason' => 'Stock received',
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'performed_by' => $performedBy->id,
            'ip_address' => request()?->ip(),
        ]);

        $inventory = $inventory->fresh(['drugBatch']);
        $drug = $batch->drug ?? Drug::find($batch->drug_id);
        if ($drug) {
            $this->syncSummaryInventory($pharmacy, $drug);
        }

        return $inventory;
    }

    public function setBatchLowStockThreshold(PharmacyBatchInventory $batch, int $threshold): void
    {
        $batch->update(['low_stock_threshold' => $threshold]);
    }

    public function findOrCreateBatch(Drug $drug, array $batchData): DrugBatch
    {
        $batch = DrugBatch::where('drug_id', $drug->id)
            ->where('batch_number', $batchData['batch_number'])
            ->first();

        if ($batch) {
            return $batch;
        }

        return DrugBatch::create([
            'drug_id' => $drug->id,
            'batch_number' => $batchData['batch_number'],
            'manufacture_date' => $batchData['manufacture_date'] ?? null,
            'expiration_date' => $batchData['expiration_date'],
            'manufacturer' => $batchData['manufacturer'] ?? null,
            'supplier_name' => $batchData['supplier_name'] ?? null,
            'category' => $batchData['category'] ?? null,
            'dosage_form' => $batchData['dosage_form'] ?? null,
            'description_en' => $batchData['description_en'] ?? null,
            'description_am' => $batchData['description_am'] ?? null,
            'status' => 'ACTIVE',
        ]);
    }

    public function getStockHistory(Pharmacy $pharmacy, Drug $drug, int $days = 30): Collection
    {
        $startDate = now()->subDays($days);

        return StockHistory::where('created_at', '>=', $startDate)
            ->where(function ($query) use ($pharmacy, $drug) {
                $query->whereHas('pharmacyBatchInventory', fn ($q) => $q->where('pharmacy_id', $pharmacy->id))
                    ->orWhereHas('inventory', fn ($q) => $q->where('pharmacy_id', $pharmacy->id));
            })
            ->where(function ($query) use ($drug) {
                $query->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drug->id))
                    ->orWhereHas('inventory', fn ($q) => $q->where('drug_id', $drug->id));
            })
            ->with(['drugBatch', 'pharmacyBatchInventory', 'performedBy', 'inventory.drug'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getAverageSellingPrice(Pharmacy $pharmacy, Drug $drug): float
    {
        $batches = PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drug->id))
            ->where('status', 'ACTIVE')
            ->where('quantity_available', '>', 0)
            ->get();

        if ($batches->isEmpty()) {
            return 0;
        }

        $totalValue = 0;
        $totalQuantity = 0;

        foreach ($batches as $batch) {
            $totalValue += (float) $batch->unit_selling_price * $batch->quantity_available;
            $totalQuantity += $batch->quantity_available;
        }

        return $totalQuantity > 0 ? round($totalValue / $totalQuantity, 2) : 0;
    }

    public function getInventoryCostValue(Pharmacy $pharmacy, Drug $drug): float
    {
        return (float) PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drug->id))
            ->where('status', 'ACTIVE')
            ->sum(DB::raw('unit_cost_price * quantity_available'));
    }

    public function syncSummaryInventory(Pharmacy $pharmacy, Drug $drug): PharmacyDrugInventory
    {
        $summary = $this->ensureSummaryInventory($pharmacy, $drug->id);
        $summary->syncFromBatches();

        return $summary->fresh();
    }

    public function ensureSummaryInventory(Pharmacy $pharmacy, int $drugId, array $defaults = []): PharmacyDrugInventory
    {
        $inventory = PharmacyDrugInventory::withTrashed()
            ->where('pharmacy_id', $pharmacy->id)
            ->where('drug_id', $drugId)
            ->first();

        if ($inventory?->trashed()) {
            $inventory->restore();
        }

        if (!$inventory) {
            $inventory = PharmacyDrugInventory::create(array_merge([
                'pharmacy_id' => $pharmacy->id,
                'drug_id' => $drugId,
                'stock' => 0,
                'low_stock_threshold' => 10,
                'price' => 0,
                'about_drug_en' => $defaults['about_drug_en'] ?? 'N/A',
                'expire_date' => $defaults['expire_date'] ?? now()->addYear(),
                'status' => 'OUT_OF_STOCK',
            ], $defaults));
        }

        return $inventory;
    }

    private function getNextFifoOrder(Pharmacy $pharmacy, Drug $drug): int
    {
        $maxOrder = PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drug->id))
            ->max('fifo_order');

        return ($maxOrder ?? 0) + 1;
    }

    public function formatBatchForApi(PharmacyBatchInventory $batch): array
    {
        $drugBatch = $batch->drugBatch;
        $drug = $drugBatch?->drug;

        return [
            'drug' => $drug ? [
                'id' => $drug->id,
                'generic_name' => $drug->generic_name,
                'brand_name_en' => $drug->brand_name_en,
                'brand_name_am' => $drug->brand_name_am,
            ] : null,
            'batch_inventory_id' => $batch->id,
            'batch_id' => $drugBatch?->id,
            'batch_number' => $drugBatch?->batch_number,
            'manufacture_date' => $drugBatch?->manufacture_date?->format('Y-m-d'),
            'expiration_date' => $drugBatch?->expiration_date?->format('Y-m-d'),
            'days_to_expiry' => $drugBatch?->getDaysUntilExpiration(),
            'quantity_received' => $batch->quantity_received,
            'available' => $batch->quantity_available,
            'reserved' => $batch->quantity_reserved,
            'dispensed' => $batch->quantity_dispensed,
            'expired' => $batch->quantity_expired,
            'damaged' => $batch->quantity_damaged,
            'price' => (float) $batch->unit_selling_price,
            'cost' => (float) $batch->unit_cost_price,
            'margin' => $batch->unit_selling_price && $batch->unit_cost_price
                ? round((($batch->unit_selling_price - $batch->unit_cost_price) / $batch->unit_selling_price) * 100, 1)
                : null,
            'fifo_order' => $batch->fifo_order,
            'received_at' => $batch->received_at?->toIso8601String(),
            'status' => $batch->status,
            'manufacturer' => $drugBatch?->manufacturer,
            'category' => $drugBatch?->category,
            'dosage_form' => $drugBatch?->dosage_form,
            'description_en' => $drugBatch?->description_en,
            'description_am' => $drugBatch?->description_am,
            'low_stock_threshold' => $batch->resolveLowStockThreshold(),
            'batch_low_stock_threshold' => $batch->low_stock_threshold,
            'is_low_stock' => $batch->isLowStock(),
        ];
    }
}
