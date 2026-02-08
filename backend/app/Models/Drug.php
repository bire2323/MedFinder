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
       
    ];

    public function priceHistories()
    {
        return $this->hasMany(DrugPriceHistory::class, 'drug_id');
    }
      public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class)
                    ->withPivot('stock',"price",'about_drug_en','about_drug_am', 'expire_date','status')
                    ->withTimestamps();
    }
}
