<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PharmacyDrugInventory extends Model
{
    //
    protected $table = 'PharmacyDrugInventory';
    protected $fillable = [
        'DrugId',
        'PharmacyId',
        'QuantityAvailable',
        'UnitCost',
        'SellingPrice',
        'Status'
    ];
}
