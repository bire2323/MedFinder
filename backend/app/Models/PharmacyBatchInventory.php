<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PharmacyBatchInventory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'pharmacy_id',
        'drug_batch_id',
        'quantity_received',
        'quantity_available',
        'quantity_reserved',
        'quantity_dispensed',
        'quantity_expired',
        'quantity_damaged',
        'low_stock_threshold',
        'unit_cost_price',
        'unit_selling_price',
        'received_at',
        'first_dispensed_at',
        'last_dispensed_at',
        'fifo_order',
        'storage_location',
        'notes',
        'status',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'first_dispensed_at' => 'datetime',
        'last_dispensed_at' => 'datetime',
        'unit_cost_price' => 'decimal:2',
        'unit_selling_price' => 'decimal:2',
    ];

    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function drugBatch(): BelongsTo
    {
        return $this->belongsTo(DrugBatch::class);
    }

    public function stockHistories(): HasMany
    {
        return $this->hasMany(StockHistory::class, 'pharmacy_batch_inventory_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(BatchReservation::class);
    }

    public function getSellableQuantity(): int
    {
        return max(0, $this->quantity_available - $this->quantity_reserved);
    }

    public function resolveLowStockThreshold(): int
    {
        if ($this->low_stock_threshold !== null) {
            return (int) $this->low_stock_threshold;
        }

        $drugId = $this->drugBatch?->drug_id;
        if (!$drugId) {
            return 10;
        }

        return (int) (PharmacyDrugInventory::where('pharmacy_id', $this->pharmacy_id)
            ->where('drug_id', $drugId)
            ->value('low_stock_threshold') ?? 10);
    }

    public function isLowStock(): bool
    {
        return $this->quantity_available <= $this->resolveLowStockThreshold();
    }

    public function canDispense(): bool
    {
        return $this->status === 'ACTIVE'
            && $this->quantity_available > 0
            && $this->drugBatch
            && !$this->drugBatch->isExpired();
    }

    public function deduct(int $quantity, ?string $reason = null, ?User $performedBy = null, ?string $type = 'SALE'): void
    {
        $oldQuantity = $this->quantity_available;

        $this->decrement('quantity_available', $quantity);
        $this->increment('quantity_dispensed', $quantity);

        $updates = ['last_dispensed_at' => now()];
        if (!$this->first_dispensed_at) {
            $updates['first_dispensed_at'] = now();
        }
        $this->update($updates);

        StockHistory::create([
            'inventory_id' => $this->getSummaryInventoryId(),
            'pharmacy_batch_inventory_id' => $this->id,
            'drug_batch_id' => $this->drug_batch_id,
            'old_stock' => $oldQuantity,
            'new_stock' => $this->quantity_available,
            'old_quantity' => $oldQuantity,
            'new_quantity' => $this->quantity_available,
            'change_amount' => -$quantity,
            'type' => $type,
            'reason' => $reason,
            'performed_by' => $performedBy?->id ?? auth()->id(),
            'ip_address' => request()?->ip(),
        ]);
    }

    protected function getSummaryInventoryId(): ?int
    {
        $drugId = $this->drugBatch?->drug_id;
        if (!$drugId) {
            return null;
        }

        return PharmacyDrugInventory::where('pharmacy_id', $this->pharmacy_id)
            ->where('drug_id', $drugId)
            ->value('id');
    }
}
