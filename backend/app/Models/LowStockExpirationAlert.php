<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LowStockExpirationAlert extends Model
{
    
    protected $fillable = [
        'pharmacy_id',
        'drug_id',
        'expiration_date',
        'notified_date',
        'notification_message'
    ];

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    public function drug()
    {
        return $this->belongsTo(Drug::class, 'drug_id');
    }
}
