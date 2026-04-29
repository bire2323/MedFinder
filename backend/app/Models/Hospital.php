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
        "contact_email",
        "address_description_en",
        "address_description_am",
        "status",
        "rejection_reason",
        "approved_by"
    ];

    protected $casts = [
        'working_hour' => 'array',
        'is_full_time_service' => 'boolean',
    ];


public function getLogoUrlAttribute() {
    return asset('storage/' . $this->logo);
}

public function getOfficialLicenseUploadUrlAttribute() {
    return asset('storage/' . $this->official_license_upload);
}

protected $appends = ['logo_url', 'official_license_upload_url'];

    public function addresses()
    {
        return $this->morphMany(Location::class, 'addressable');
    }
    public function services()
    {
        return $this->morphMany(FacilityService::class, 'addressable');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
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
        
        return $this->belongsToMany(Department::class, 'hospital_departments', 'hospital_id', 'department_id');
    }
}
