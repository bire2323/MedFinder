<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    //
    protected $table = "Department";
    protected $fillable = [
        "DepartmentNameEn",
        "DepartmentNameAm",
        "DepartmentCategoryNameEn",
        "DepartmentCategoryNameAm"
    ];
}
