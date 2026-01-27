<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Drug extends Model
{
    //
    protected $table = "Drug";
    protected $fillable = [
        "GenericName",
        "BrandNameEn",
        "BrandNameAm",
        "Manufacturer",
        "DrugCategory"
    ];

    public function priceHistories()
    {
        return $this->hasMany(DrugPriceHistory::class, 'drugId');
    }
}
