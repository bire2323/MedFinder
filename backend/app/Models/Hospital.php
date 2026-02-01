<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hospital extends Model
{

    protected $fillable = [
        "hospital_agent_id",
        "hospital_name_en",
        "hospital_name_am",
        "is_full_time_service",
        "hospital_ownership_type",
        "working_hour",
        "license_number",
        "official_license_upload",
        "logo",
        "emergency_contact",
        "address_description"
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
        return $this->belongsTo(User::class, 'hospital_agent_id');
    }

    public function hospitalDepartments()
    {
        return $this->hasMany(HospitalDepartment::class, 'hospital_id');
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'HospitalDepartment', 'hospital_id', 'department_id');
    }
}
