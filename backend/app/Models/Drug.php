<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
      public function pharmacies(): BelongsToMany
    {
        return $this->belongsToMany(Pharmacy::class,'pharmacy_drug_inventories')
                    ->withPivot('id','stock',"price",'about_drug_en','about_drug_am','prescription_required', 'expire_date','status')
                    ->withTimestamps()
                    ->using(PharmacyDrugInventory::class)
                    ->as('inventory');
    }
}
