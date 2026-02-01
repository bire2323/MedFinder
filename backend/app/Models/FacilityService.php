<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacilityService extends Model
{
    //
  
    protected $fillable = [
        "addressable_id",
        "addressable_type",
        "is_available",
        "notes"
    ];

    public function addressable()
    {
        return $this->morphTo();   // magic — works with both Hospital & Pharmacy
    }
}
