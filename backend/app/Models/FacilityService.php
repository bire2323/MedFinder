<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacilityService extends Model
{
    //
    protected $table = "FacilityService";
    protected $fillable = [
        "addressable_id",
        "addressable_type",
        "IsAvailable",
        "Notes"
    ];

    public function addressable()
    {
        return $this->morphTo();   // magic — works with both Hospital & Pharmacy
    }
}
