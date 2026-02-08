<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        "logo",
        "address_description_en",
        "address_description_am"
    ];

    public function addresses()
    {
        return $this->morphMany(Location::class, 'addressable');
    }
    public function services()
    {
        return $this->morphMany(FacilityService::class, 'addressable');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'pharmacy_agent_id');
    }

    public function inventories()
    {
        return $this->hasMany(PharmacyDrugInventory::class, 'pharmacy_id');
    }

     public function drugs()
    {
        return $this->belongsToMany(Drug::class)
                    ->withPivot('stock', 'price','about_drug_en', 'about_drug_am','expire_date','status')
                    ->withTimestamps();
    }
   

}
