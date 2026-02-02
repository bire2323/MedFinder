export function localizeFacility(facility, type, lang) {
  const isAm = lang === "am";
  const isHospital= type==='hospital'; 

  return {
    id: facility.id,
    hospital_agent_id: isHospital ? facility.hospital_agent_id : facility.pharmacy_agent_id,
    approved_by: facility.approved_by,
    facility_name: isAm ? isHospital ? facility.hospital_name_am: facility.pharmacy_name_am : isHospital ? facility.hospital_name_en : facility.pharmacy_name_en,
    facility_ownership_type: isHospital ? facility.hospital_ownership_type : facility.pharmacy_ownership_type,
    license_number: facility.license_number,
    official_license_upload: facility.official_license_upload,
    working_hour: facility.working_hour,
    logo:facility.logo,
    is_full_time_service: facility.is_full_time_service,
    emergency_contact:facility.emergency_contact,
    address_description: isAm ? facility.address_description_am : facility.address_description_en,
    status:facility.status,

  }
}