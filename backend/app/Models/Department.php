<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    //
    
    protected $fillable = [
        "department_name_en",
        "department_name_am",
        "department_category_name_en",
        "department_category_name_am"
    ];
}
