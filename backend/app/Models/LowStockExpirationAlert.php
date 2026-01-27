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

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacyId');
    }

    public function drug()
    {
        return $this->belongsTo(Drug::class, 'drugId');
    }
}
