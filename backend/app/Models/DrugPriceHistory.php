<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DrugPriceHistory extends Model
{
    
    protected $fillable = [
        'drug_id',
        'pharmacy_id',
        'old_price',
        'new_price',

    ];

    public function drug()
    {
        return $this->belongsTo(Drug::class, 'drug_id');
    }

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }
}
