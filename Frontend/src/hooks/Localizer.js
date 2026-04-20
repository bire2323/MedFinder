export function localizeFacility(facility, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';

  return {
    ...facility,
    id: facility.id,
    facility_agent_id: isHospital ? facility.hospital_agent_id : facility.pharmacy_agent_id,
    approved_by: facility.approved_by,
    hospital_agent_id: isHospital ? facility.hospital_agent_id : facility.pharmacy_agent_id,
    facility_name: isAm ? isHospital ? facility.hospital_name_am : facility.pharmacy_name_am : isHospital ? facility.hospital_name_en : facility.pharmacy_name_en,
    facility_ownership_type: isHospital ? facility.hospital_ownership_type : facility.pharmacy_ownership_type,
    license_document_url: facility.license_document_url,
    license_number: facility.license_number,
    official_license_upload: isHospital ? facility.official_license_upload : facility.pharmacy_license_upload,
    working_hour: facility.working_hour,
    logo: facility.logo,
    is_full_time_service: isHospital ? facility.is_full_time_service : 0,
    contact_phone: facility.contact_phone,
    contact_email: facility.contact_email,
    addresses: facility.addresses ? facility.addresses.map(a => localizeAddress(a, type, lang)) : [],
    inventory: isHospital ? [] : facility.drugs ? facility.drugs.map(d => localizeDrugs(d, type, lang)) : [],
    address_description: isAm ? facility.address_description_am : facility.address_description_en,
    status: facility.status,
    logo_url: facility.logo_url,
    lat: facility.addresses && facility.addresses.length > 0 ? parseFloat(facility.addresses[0].latitude) : null,
    lng: facility.addresses && facility.addresses.length > 0 ? parseFloat(facility.addresses[0].longitude) : null,
    type: type,
    name: isAm ? isHospital ? facility.hospital_name_am : facility.pharmacy_name_am : isHospital ? facility.hospital_name_en : facility.pharmacy_name_en,
  }
}
export function localizeDrugs(drug, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';
  return {
    id: drug.id,
    generic_name: drug.generic_name,
    brand_name: isAm ? drug.brand_name_am : drug.brand_name_en,
    about_drug: isAm ? drug.inventory?.about_drug_am : drug.inventory?.about_drug_en,
    price: drug.inventory?.price,
    stock: drug.inventory?.stock,
    pharmacy_id: drug.inventory?.pharmacy_id,
    drug_id: drug.inventory?.drug_id,
    prescription_required: drug.inventory?.prescription_required,
    expire_date: drug.inventory?.expire_date,
    status: drug.inventory?.status,

  };
}
export function localizeAddress(address, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';
  return {
    ...address,
    id: address.id,
    address_type: address.address_type,
    addressable_id: address.addressable_id,
    addressable_type: address.addressable_type,

    kebele: address.kebele,
    latitude: address.latitude,
    longitude: address.longitude,

    region: isAm ? address.region_am : address.region_en,
    sub_city: isAm ? address.sub_city_am : address.sub_city_en,
    zone: isAm ? address.zone_am : address.zone_en,
  };
}