<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockHistory extends Model
{
    protected $fillable = [
        'inventory_id',
        'old_stock',
        'new_stock',
        'change_amount',
        'type',
        'reason',
        'performed_by',
    ];

    public function inventory()
    {
        return $this->belongsTo(PharmacyDrugInventory::class, 'inventory_id');
    }

    public function performedBy()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
