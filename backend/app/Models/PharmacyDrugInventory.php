<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PharmacyDrugInventory extends Model
{
    //
    protected $table = 'pharmacy_drug_inventories';
    protected $fillable = [
        'drug_id',
        'pharmacy_id',
        'stock',
        'price',
        'about_drug_en',
        'about_drug_am',
        "prescription_required",
        "expire_date",
        'status'
    ];
}
