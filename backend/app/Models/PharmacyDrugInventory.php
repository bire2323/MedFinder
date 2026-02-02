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
        'quantity_available',
        'selling_price',
        "expire_date",
        'status'
    ];
}
