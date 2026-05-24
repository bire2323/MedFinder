export function localizeFacility(facility, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';
  const mainAddress = Array.isArray(facility?.addresses) && facility.addresses.length > 0 ? facility.addresses[0] : null;

  const regionName = isAm
    ? (mainAddress?.region?.name_am ?? mainAddress?.region_am ?? mainAddress?.region?.name_en ?? "")
    : (mainAddress?.region?.name_en ?? mainAddress?.region_en ?? mainAddress?.region?.name_am ?? "");

  const cityName = isAm
    ? (mainAddress?.city?.name_am ?? mainAddress?.sub_city_am ?? mainAddress?.city_am ?? mainAddress?.city?.name_en ?? "")
    : (mainAddress?.city?.name_en ?? mainAddress?.sub_city_en ?? mainAddress?.city_en ?? mainAddress?.city?.name_am ?? "");

  // In newer backend responses address text is inside addresses[0].description_en/am
  const addressDescriptionEn =
    facility?.address_description_en ??
    mainAddress?.address_description_en ??
    mainAddress?.description_en ??
    "";
  const addressDescriptionAm =
    facility?.address_description_am ??
    mainAddress?.address_description_am ??
    mainAddress?.description_am ??
    "";

  // For UI: prefer description, otherwise show "City, Region"
  const addressDescription = isAm
    ? (addressDescriptionAm || [cityName, regionName].filter(Boolean).join(", "))
    : (addressDescriptionEn || [cityName, regionName].filter(Boolean).join(", "));

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
    departments: !isHospital ? [] : facility.departments ? facility.departments.map(d => localizeDepartments(d, type, lang)) : [],
    services: !isHospital ? [] : facility.services ? facility.services.map(s => localizeServices(s, type, lang)) : [],
    // keep both language variants for components that rely on them
    address_description_en: addressDescriptionEn,
    address_description_am: addressDescriptionAm,
    address_description: addressDescription,
    // convenience for some UIs
    region: regionName,
    city: cityName,
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
  const inv = drug.inventory || {};
  return {
    id: drug.id,
    generic_name: drug.generic_name,
    brand_name: isAm ? drug.brand_name_am : drug.brand_name_en,
    brand_name_en: drug.brand_name_en,
    brand_name_am: drug.brand_name_am,

    // inventory (flattened for UI convenience)
    inventory_id: inv.id,
    about_drug: isAm ? inv.about_drug_am : inv.about_drug_en,
    about_drug_en: inv.about_drug_en,
    about_drug_am: inv.about_drug_am,
    price: inv.price,
    cost_price: inv.cost_price,
    stock: inv.stock,
    low_stock_threshold: inv.low_stock_threshold,
    prescription_required: inv.prescription_required,
    expire_date: inv.expire_date,
    batch_number: inv.batch_number,
    status: inv.status,
    is_available: inv.is_available,

    pharmacy_id: inv.pharmacy_id,
    drug_id: inv.drug_id,

  };
}
export function localizeServices(service, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';
  return {
    id: service.id,
    name: isAm ? service.service?.service_name_am : service.service?.service_name_en,
    category: isAm ? service.service?.service_category_name_am : service.service?.service_category_name_en,
  };
}
export function localizeDepartments(department, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';
  return {
    id: department.id,
    name: isAm ? department.department_name_am : department.department_name_en,
    category: isAm ? department.department_category_name_am : department.department_category_name_en,
  };
}

export function localizeAddress(address, type, lang) {
  const isAm = lang === "am";
  const isHospital = type === 'hospital';

  const regionName = isAm
    ? (address?.region?.name_am ?? address?.region_am ?? address?.region?.name_en ?? "")
    : (address?.region?.name_en ?? address?.region_en ?? address?.region?.name_am ?? "");

  const cityName = isAm
    ? (address?.city?.name_am ?? address?.sub_city_am ?? address?.city_am ?? address?.city?.name_en ?? "")
    : (address?.city?.name_en ?? address?.sub_city_en ?? address?.city_en ?? address?.city?.name_am ?? "");

  const descEn = address?.address_description_en ?? address?.description_en ?? "";
  const descAm = address?.address_description_am ?? address?.description_am ?? "";
  return {
    ...address,
    id: address.id,
    address_type: address.address_type,
    addressable_id: address.addressable_id,
    addressable_type: address.addressable_type,

    kebele: address.kebele,
    latitude: address.latitude,
    longitude: address.longitude,

    // normalized fields used by FacilityDetailPage and others
    region: regionName,
    sub_city: cityName,
    // zone is not part of the current backend response shape; keep empty for safety
    zone: "",

    // keep language variants for other consumers
    region_en: address?.region?.name_en ?? address.region_en ?? "",
    region_am: address?.region?.name_am ?? address.region_am ?? "",
    sub_city_en: address?.city?.name_en ?? address.sub_city_en ?? address.city_en ?? "",
    sub_city_am: address?.city?.name_am ?? address.sub_city_am ?? address.city_am ?? "",
    description_en: descEn,
    description_am: descAm,
  };
}
