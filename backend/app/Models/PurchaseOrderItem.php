<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id',
        'drug_id',
        'drug_batch_id',
        'quantity_ordered',
        'quantity_received',
        'quantity_rejected',
        'unit_price',
        'total_price',
        'expected_batch_number',
        'expected_expiration_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'expected_expiration_date' => 'date',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(DrugPurchaseOrder::class, 'purchase_order_id');
    }

    public function drug(): BelongsTo
    {
        return $this->belongsTo(Drug::class);
    }

    public function drugBatch(): BelongsTo
    {
        return $this->belongsTo(DrugBatch::class);
    }
}
