<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pharmacy extends Model
{
    protected $table = 'pharmacies';

    protected $fillable = [
        'pharmacy_agent_id',
        'pharmacy_name_en',
        'pharmacy_name_am',
        'license_number',
        'pharmacy_license_category',
        'pharmacy_license_upload',
        'working_hour',
        'contact_email',
        'contact_phone',
        'logo',
        'status',
        'rejection_reason',
        'approved_by',
    ];

    protected $casts = [
        'working_hour' => 'array',
    ];

    protected $appends = ['logo_url', 'license_document_url'];

    public function getLogoUrlAttribute()
    {
        return $this->logo ? asset('storage/' . $this->logo) : null;
    }

    public function getLicenseDocumentUrlAttribute()
    {
        return isset($this->license_document) ? asset('storage/' . $this->license_document) : null;
    }

    public function addresses()
    {
        return $this->morphMany(Location::class, 'addressable');
    }

    public function services()
    {
        return $this->morphMany(FacilityService::class, 'addressable');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'pharmacy_agent_id');
    }

    public function drugs(): BelongsToMany
    {
        return $this->belongsToMany(Drug::class, 'pharmacy_drug_inventories')
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

    public function drugInventories(): HasMany
    {
        return $this->hasMany(PharmacyDrugInventory::class);
    }

    public function batchInventories(): HasMany
    {
        return $this->hasMany(PharmacyBatchInventory::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(DrugPurchaseOrder::class);
    }
}
