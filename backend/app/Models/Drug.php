<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Drug extends Model
{
    protected $fillable = [
        'generic_name',
        'brand_name_en',
        'brand_name_am',
    ];

    public function priceHistories()
    {
        return $this->hasMany(DrugPriceHistory::class, 'drug_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(DrugBatch::class);
    }

    public function activeBatches(): HasMany
    {
        return $this->batches()->where('status', 'ACTIVE');
    }

    public function batchesByFifo()
    {
        return $this->batches()
            ->where('status', 'ACTIVE')
            ->orderBy('expiration_date', 'asc');
    }

    public function getTotalStockInPharmacy(Pharmacy $pharmacy): int
    {
        return (int) PharmacyBatchInventory::where('pharmacy_id', $pharmacy->id)
            ->whereHas('drugBatch', fn ($q) => $q->where('drug_id', $this->id))
            ->where('status', 'ACTIVE')
            ->sum('quantity_available');
    }

    public function pharmacies(): BelongsToMany
    {
        return $this->belongsToMany(Pharmacy::class, 'pharmacy_drug_inventories')
            ->withPivot(
                'id',
                'stock',
                'price',
                'cost_price',
                'about_drug_en',
                'about_drug_am',
                'prescription_required',
                'expire_date',
                'batch_number',
                'status',
                'low_stock_threshold',
                'is_available'
            )
            ->withTimestamps()
            ->using(PharmacyDrugInventory::class)
            ->as('inventory');
    }
}
