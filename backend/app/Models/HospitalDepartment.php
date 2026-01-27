<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalDepartment extends Model
{
    //
    protected $table = 'HospitalDepartment';
    protected $fillable = [
        'DepartmentId',
        'HospitalId'
    ];

    public function hospital()
    {
        return $this->belongsTo(Hospital::class, 'HospitalId');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentId');
    }
}
