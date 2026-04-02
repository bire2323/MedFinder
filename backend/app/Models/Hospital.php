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
        "contact_email",
        "contact_phone",
        "address_description_en",
        "address_description_am",
        "status",
        "rejection_reason",
        "approved_by"
    ];


public function getLogoUrlAttribute() {
    return asset('storage/' . $this->logo);
}

public function getLicenseDocumentUrlAttribute() {
    return asset('storage/' . $this->license_document);
}

protected $appends = ['logo_url', 'license_document_url'];

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
        return $this->belongsToMany(Department::class, 'HospitalDepartment', 'hospital_id', 'department_id');
    }
}
