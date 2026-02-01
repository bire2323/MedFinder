/**
 * API functions for pharmacy and hospital registration
 */

const API_BASE_Local = "http://localhost:8000/api";

const getAuthToken = () => localStorage.getItem('token');
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
 
  data.append('email', formData.email || '');

  
  // Location info
    data.append('region_en', formData.region_en);
  data.append('region_am', formData.region_am);
  data.append('zone_en', formData.zone_en);
  data.append('zone_am', formData.zone_am);

  data.append('sub_city_en', formData.subCity_en);
  data.append('sub_city_am', formData.subCity_am);
  data.append('kebele', formData.kebele || '');
  data.append('detailed_address', formData.detailedAddress || '');
  data.append('latitude', formData.latitude);
  data.append('longitude', formData.longitude);
 data.append('working_hour', formData.workingHour);
  data.append('emergency_contact', formData.mainContactPhone);
  
  // Verification info
  data.append('license_number', formData.licenseNumber);
  data.append('pharmacy_type', formData.pharmacyType);
  data.append('working_hours', formData.workingHours);
  
  // File uploads
  if (formData.licenseDocument) {
    data.append('license_document', formData.licenseDocument);
  }
  if (formData.pharmacyLogo) {
    data.append('logo', formData.pharmacyLogo);
  }

  const res = await fetch(`${API_BASE_Local}/register/pharmacy`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
      // Note: Don't set Content-Type for FormData - browser sets it automatically with boundary
    },
    body: data,
  });
  
  return res.json();
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

  data.append('email', formData.email || '');
  
  
  // Location info

  data.append('region_en', formData.region_en);
  data.append('region_am', formData.region_am);
  data.append('zone_en', formData.zone_en);
  data.append('zone_am', formData.zone_am);

  data.append('sub_city_en', formData.subCity_en);
  data.append('sub_city_am', formData.subCity_am);
  data.append('kebele', formData.kebele || '');
  data.append('detailed_address', formData.detailedAddress || '');
  data.append('latitude', formData.latitude);
  data.append('longitude', formData.longitude);
  data.append('working_hour', formData.workingHour);
  data.append('emergency_contact', formData.mainContactPhone);
  
  // Verification info
  data.append('license_number', formData.licenseNumber);
  data.append('ownership_type', formData.ownershipType);
  data.append('provides_emergency', formData.providesEmergency ? '1' : '0');
  data.append('operates_24_hours', formData.operates24Hours ? '1' : '0');
  
  // File uploads
  if (formData.licenseDocument) {
    data.append('license_document', formData.licenseDocument);
  }
  if (formData.hospitalLogo) {
    data.append('logo', formData.hospitalLogo);
  }

  const res = await fetch(`${API_BASE_Local}/register/hospital`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: data,
  });
  
  return res.json();
}

export default { apiRegisterPharmacy, apiRegisterHospital };
