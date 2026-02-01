<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    //
   
    protected $fillable = [
        "service_name_en",
        "service_name_am",
        "service_category_name_en",
        "service_category_name_am"
    ];
}
