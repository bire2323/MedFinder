<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalDepartment extends Model
{
    //
   
    protected $fillable = [
        'department_id',
        'hospital_id'
    ];

    public function hospital()
    {
        return $this->belongsTo(Hospital::class, 'hospital_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
