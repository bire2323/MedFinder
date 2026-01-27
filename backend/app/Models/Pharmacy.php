<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pharmacy extends Model
{
    protected $table = "Pharmacy";
    protected $fillable = [
        "PharmacyAgentId",
        "LicenceNumber",
        "PharmacyLicenseCategory",
        "PharmacyLicenseUpload",
        "WorkingHour",
        "Logo",
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
        return $this->belongsTo(User::class, 'PharmacyAgentId');
    }

    public function inventories()
    {
        return $this->hasMany(PharmacyDrugInventory::class, 'PharmacyId');
    }

    public function drugs()
    {
        return $this->belongsToMany(Drug::class, 'PharmacyDrugInventory', 'PharmacyId', 'DrugId');
    }
}
