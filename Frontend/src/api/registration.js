/**
 * API functions for pharmacy and hospital registration
 */
import { apiFetch, ensureCsrfCookie } from "./client";
/**
 * Register a new pharmacy
 * @param {Object} formData - The pharmacy registration data
 * @returns {Promise<Object>} - API response
 */
export async function apiRegisterPharmacy(formData) {
  // Create FormData for file uploads
  const data = new FormData();

  // Basic info
  data.append('facilityNameEn', formData.facilityNameEn);
  data.append('facilityNameAm', formData.facilityNameAm);

  data.append('contact_email', formData.contact_email || '');


  // Location info
  data.append('region_id', formData.region_id);
  data.append('city_id', formData.city_id);
  data.append('kebele', formData.kebele || '');
  data.append('description_en', formData.description_en || '');
  data.append('description_am', formData.description_am || '');
  data.append('latitude', formData.latitude);
  data.append('longitude', formData.longitude);
  data.append('address_type', formData.address_type || 'main');
  data.append('working_hour', JSON.stringify(formData.workingHour || {}));
  data.append('contact_phone', formData.contact_phone);

  // Verification info
  data.append('license_number', formData.licenseNumber);
  data.append('pharmacy_type', formData.pharmacyType);

  // File uploads
  if (formData.licenseDocument) {
    data.append('license_document', formData.licenseDocument);
  }
  if (formData.pharmacyLogo) {
    data.append('logo', formData.pharmacyLogo);
  }

  await ensureCsrfCookie();
  return apiFetch("/api/register/pharmacy", {
    method: "POST",
    body: data,
  });
}

/**
 * Register a new hospital
 * @param {Object} formData - The hospital registration data
 * @returns {Promise<Object>} - API response
 */
export async function apiRegisterHospital(formData) {
  // Create FormData for file uploads
  const data = new FormData();

  // Basic info
  data.append('facilityNameEn', formData.facilityNameEn);
  data.append('facilityNameAm', formData.facilityNameAm);

  data.append('contact_email', formData.contact_email || '');


  // Location info

  data.append('region_id', formData.region_id);
  data.append('city_id', formData.city_id);
  data.append('kebele', formData.kebele || '');
  data.append('description_en', formData.description_en || '');
  data.append('description_am', formData.description_am || '');
  data.append('latitude', formData.latitude);
  data.append('longitude', formData.longitude);
  data.append('address_type', formData.address_type || 'main');
  data.append('working_hour', JSON.stringify(formData.workingHour || {}));
  data.append('contact_phone', formData.contact_phone);

  // Verification info
  data.append('license_number', formData.licenseNumber);
  data.append('hospital_ownership_type', formData.ownershipType);
  data.append('provides_emergency', formData.providesEmergency ? '1' : '0');
  data.append('operates_24_hours', formData.operates24Hours ? '1' : '0');

  // File uploads
  if (formData.licenseDocument) {
    data.append('license_document', formData.licenseDocument);
  }
  if (formData.hospitalLogo) {
    data.append('logo', formData.hospitalLogo);
  }

  await ensureCsrfCookie();
  return apiFetch("/api/register/hospital", {
    method: "POST",
    body: data,
  });
}

export default { apiRegisterPharmacy, apiRegisterHospital };
