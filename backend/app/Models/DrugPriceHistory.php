<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrugPriceHistory extends Model
{
    //
    protected $table = "DrugPriceHistory";
    protected $fillable = [
        'drugId',
        'pharmacyId',
        'OldPrice',
        'NewPrice',

    ];
}
