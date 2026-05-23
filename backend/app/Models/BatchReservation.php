<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class BatchReservation extends Model
{
    protected $fillable = [
        'pharmacy_batch_inventory_id',
        'reservable_type',
        'reservable_id',
        'quantity_reserved',
        'reserved_at',
        'expires_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function pharmacyBatchInventory(): BelongsTo
    {
        return $this->belongsTo(PharmacyBatchInventory::class);
    }

    public function reservable(): MorphTo
    {
        return $this->morphTo();
    }
}
