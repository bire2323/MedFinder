/**
 * Validation rules for Pharmacy and Hospital Profile Settings
 * Supports bilingual (English/Amharic) character sets and local formats.
 */

export const validateProfile = (data,type) => {
  const errors = {};
if (type==="pharmacy") {
  
  // Facility Name (EN) - Letters, numbers, and common punctuation
  if (!data.pharmacy_name_en || data.pharmacy_name_en.trim().length < 3) {
    errors.pharmacy_name_en = "Name must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9\s.,&'()-]+$/.test(data.pharmacy_name_en)) {
    errors.pharmacy_name_en = "English name contains invalid characters.";
  }
  
  // Facility Name (AM) - Specifically Ge'ez/Amharic characters
  // Range: \u1200-\u137F (Ethiopic)
  if (!data.pharmacy_name_am || data.pharmacy_name_am.trim().length < 2) {
    errors.pharmacy_name_am = "Amharic name is required.";
  } else if (!/^[\u1200-\u137F\s0-9.,-]+$/.test(data.pharmacy_name_am)) {
    errors.pharmacy_name_am = "Please use Amharic characters for this field.";
  }
}else if (type === "hospital") {
  
    
  // Facility Name (EN) - Letters, numbers, and common punctuation
  if (!data.hospital_name_en || data.hospital_name_en.trim().length < 3) {
    errors.hospital_name_en = "Name must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9\s.,&'()-]+$/.test(data.hospital_name_en)) {
    errors.hospital_name_en = "English name contains invalid characters.";
  }
  
  // Facility Name (AM) - Specifically Ge'ez/Amharic characters
  // Range: \u1200-\u137F (Ethiopic)
  if (!data.hospital_name_am || data.hospital_name_am.trim().length < 2) {
    errors.hospital_name_am = "Amharic name is required.";
  } else if (!/^[\u1200-\u137F\s0-9.,-]+$/.test(data.hospital_name_am)) {
    errors.hospital_name_am = "Please use Amharic characters for this field.";
  } 

}


  // Phone Numbers (Ethiopian format: 09... or 07... or +251...)
  const phoneRegex = /^(?:\+251|0)[97]\d{8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.contact_phone && !phoneRegex.test(data.contact_phone)) {
    errors.contact_phone = "Invalid Ethiopian phone number (e.g., 0911223344).";
  }
  if (data.contact_email && !emailRegex.test(data.contact_email)) {
    errors.contact_email = "Invalid contact email address.";
  }

  // Coordinates
  if (data.latitude !== undefined && (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }
  if (data.longitude !== undefined && (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  // Ownership
  if (type === "pharmacy" ? !data.pharmacy_license_category : !data.hospital_ownership_type) {
     errors.ownership_type = "Please select an ownership type.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
