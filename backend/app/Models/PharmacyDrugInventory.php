<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class PharmacyDrugInventory extends Pivot
{
    use SoftDeletes;

    protected $table = 'pharmacy_drug_inventories';

    // Tell Laravel this pivot has an auto-incrementing ID
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
        "prescription_required",
        "expire_date",
        'batch_number',
        'status',
        'is_available'
    ];

    protected $casts = [
        'prescription_required' => 'boolean',
        'is_available' => 'boolean',
        'expire_date' => 'date',
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
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

    // Accessors
    public function getIsLowStockAttribute()
    {
        return $this->stock <= $this->low_stock_threshold;
    }

    public function getIsExpiredAttribute()
    {
        return $this->expire_date && $this->expire_date->isPast();
    }

    public function getDaysToExpiryAttribute()
    {
        return $this->expire_date ? now()->diffInDays($this->expire_date, false) : null;
    }
}
