<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class PharmacyDrugInventory extends Pivot
{
    use SoftDeletes;

    protected $table = 'pharmacy_drug_inventories';

    public $incrementing = true;

    protected $primaryKey = 'id';

    protected $fillable = [
        'drug_id',
        'pharmacy_id',
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
        'is_available',
        'last_stock_update',
        'last_expiry_check',
    ];

    protected $casts = [
        'prescription_required' => 'boolean',
        'is_available' => 'boolean',
        'expire_date' => 'date',
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'last_stock_update' => 'datetime',
        'last_expiry_check' => 'datetime',
    ];

    public function drug()
    {
        return $this->belongsTo(Drug::class);
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function stockHistories()
    {
        return $this->hasMany(StockHistory::class, 'inventory_id');
    }

    public function batchInventories(): HasMany
    {
        return $this->hasMany(PharmacyBatchInventory::class, 'pharmacy_id', 'pharmacy_id')
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $this->drug_id));
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->stock <= $this->low_stock_threshold;
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expire_date && $this->expire_date->isPast();
    }

    public function getDaysToExpiryAttribute(): ?int
    {
        return $this->expire_date ? (int) now()->diffInDays($this->expire_date, false) : null;
    }

    /**
     * Sync aggregated stock from batch inventories.
     */
    public function syncFromBatches(): void
    {
        $drugId = $this->drug_id;
        $pharmacyId = $this->pharmacy_id;

        $batches = PharmacyBatchInventory::where('pharmacy_id', $pharmacyId)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $drugId))
            ->where('status', 'ACTIVE')
            ->with('drugBatch')
            ->get();

        $totalStock = $batches->sum('quantity_available');

        $nearestExpiry = $batches
            ->map(fn ($b) => $b->drugBatch?->expiration_date)
            ->filter()
            ->sort()
            ->first();

        $avgPrice = $batches->where('quantity_available', '>', 0)->avg('unit_selling_price');
        $avgCost = $batches->where('quantity_available', '>', 0)->avg('unit_cost_price');

        $this->update([
            'stock' => $totalStock,
            'price' => $avgPrice ?? $this->price,
            'cost_price' => $avgCost ?? $this->cost_price,
            'expire_date' => $nearestExpiry ?? $this->expire_date,
            'status' => $totalStock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
            'last_stock_update' => now(),
            'last_expiry_check' => now(),
        ]);
    }
}
