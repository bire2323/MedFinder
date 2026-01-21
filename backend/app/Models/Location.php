<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{

    protected $table = 'Location';
    protected $fillable = [
        "addressable_id",
        "addressable_type",
        "Region",
        "Zone",
        "City",
        "SubCity",
        "Kebele",
        "Latitude",
        "Longitude",
        "AddressType"
    ];
    public function addressable()
    {
        return $this->morphTo();   // magic — works with both Hospital & Pharmacy
    }
}
