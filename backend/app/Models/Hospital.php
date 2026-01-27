<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{
    //
    protected $table = 'Hospital';
    protected $fillable = [
        "HospitalAgentId",
        "IsFullTimeService",
        "HospitalOwnershipType",
        "WorkingHour",
        "LicenseNumber",
        "OfficialLicenseUpload",
        "Logo",
        "EmergencyContact",
    ];




    public function addresses()
    {
        return $this->morphMany(Location::class, 'addressable');
    }
    public function services()
    {
        return $this->morphMany(FacilityService::class, 'addressable');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'HospitalAgentId');
    }

    public function hospitalDepartments()
    {
        return $this->hasMany(HospitalDepartment::class, 'HospitalId');
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'HospitalDepartment', 'HospitalId', 'DepartmentId');
    }
}
