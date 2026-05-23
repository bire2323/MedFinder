<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockHistory extends Model
{
    protected $casts = [
        'inventory_id' => 'integer',
        'drug_batch_id' => 'integer',
        'pharmacy_batch_inventory_id' => 'integer',
        'reference_id' => 'integer',
        'performed_by' => 'integer',
    ];

    protected $fillable = [
        'inventory_id',
        'drug_batch_id',
        'pharmacy_batch_inventory_id',
        'old_stock',
        'new_stock',
        'old_quantity',
        'new_quantity',
        'change_amount',
        'type',
        'reason',
        'reference_type',
        'reference_id',
        'notes',
        'performed_by',
        'ip_address',
    ];

    public function inventory(): BelongsTo
    {
        return $this->belongsTo(PharmacyDrugInventory::class, 'inventory_id');
    }

    public function drugBatch(): BelongsTo
    {
        return $this->belongsTo(DrugBatch::class);
    }

    public function pharmacyBatchInventory(): BelongsTo
    {
        return $this->belongsTo(PharmacyBatchInventory::class, 'pharmacy_batch_inventory_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
