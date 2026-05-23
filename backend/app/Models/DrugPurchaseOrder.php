<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DrugPurchaseOrder extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'po_number',
        'pharmacy_id',
        'supplier_id',
        'status',
        'ordered_at',
        'expected_delivery_at',
        'received_at',
        'total_amount',
        'currency',
        'notes',
        'reference_number',
        'created_by',
        'approved_by',
    ];

    protected $casts = [
        'ordered_at' => 'datetime',
        'expected_delivery_at' => 'datetime',
        'received_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id');
    }
}
