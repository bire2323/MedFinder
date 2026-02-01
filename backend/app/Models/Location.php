<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{

   use SoftDeletes;


    protected $fillable = [
        "addressable_id",
        "addressable_type",
        "region_en", "region_am",
        "zone_en", "zone_am",
       
        "sub_city_en", "sub_city_am",
        "kebele",
        "latitude",
        "longitude",
        "address_type"
    ];
    public function addressable()
    {
        return $this->morphTo();   // magic — works with both Hospital & Pharmacy
    }
}
