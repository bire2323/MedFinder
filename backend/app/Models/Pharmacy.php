<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pharmacy extends Model
{
   protected $table = "pharmacies";
    protected $fillable = [
        "pharmacy_agent_id",
        "pharmacy_name_en",
        "pharmacy_name_am",
        "license_number",
        "pharmacy_license_category",
        "pharmacy_license_upload",
        "working_hour",
        "contact_email",
        "contact_phone",
        "logo",
        "address_description_en",
        "address_description_am",
        "status",
        "rejection_reason",
        "approved_by"
    ];

public function getLogoUrlAttribute() {
    return asset('storage/' . $this->logo);
}

public function getLicenseDocumentUrlAttribute() {
    return asset('storage/' . $this->license_document);
}

protected $appends = ['logo_url', 'license_document_url'];


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
        return $this->belongsToMany(Drug::class,'pharmacy_drug_inventories')
                    ->withPivot('id','stock', 'price','about_drug_en', 'about_drug_am','prescription_required','expire_date','status')
                    ->withTimestamps()
                    ->using(PharmacyDrugInventory::class)
            ->as('inventory');
    }
   

}
