<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacilityService extends Model
{
    //
  
    protected $fillable = [
        "addressable_id",
        "addressable_type",
        "service_id",
        "is_available",
        "notes"
    ];

    public function addressable()
    {
        return $this->morphTo();
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}
