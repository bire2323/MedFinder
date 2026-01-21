<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalDepartment extends Model
{
    //
    protected $table = 'HospitalDepartment';
    protected $fillable = [
        'departmentId',
        'hospitalId'
    ];
}
