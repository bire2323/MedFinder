<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    //
    protected $table = "Service";
    protected $fillable = [
        "ServiceNameEn",
        "ServiceNameAm",
        "ServiceCategoryNameEn",
        "ServiceCategoryNameAm"
    ];
}
