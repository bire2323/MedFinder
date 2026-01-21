<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LowStockExpirationAlert extends Model
{
    //
    protected $table = 'LowStockExpirationAlert';
    protected $fillable = [
        'pharmacyId',
        'drugId',
        'ExpirationDate',
        'NotifiedDate',
        'NotifionMessage'
    ];
}
