<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Drug extends Model
{
    //
   
    protected $fillable = [
        "generic_name",
        "brand_name_en",
        "brand_name_am",
        "manufacturer",
        "drug_category"
    ];

    public function priceHistories()
    {
        return $this->hasMany(DrugPriceHistory::class, 'drug_id');
    }
      public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class)
                    ->withPivot('quantity_available',"selling_price", 'expiry_date','status')
                    ->withTimestamps();
    }
}
