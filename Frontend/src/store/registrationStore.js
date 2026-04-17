/**
 * Zustand store for multi-step registration wizard
 * Manages form data and current step for both pharmacy and hospital registration
 */
import { create } from 'zustand';

// Initial form data structure
const initialFormData = {
  // Step 1: Basic Information
 facilityNameEn: '',
  facilityNameAm: '',
 
 
 
  agreedToTerms: false,

  // Step 2: Location & Contact
  region_en: '',
  region_am: '',
  zone_en: '',
  zone_am: '',
  subCity_en: '',
  subCity_am: '',
  kebele: '',
  detailedAddress_en: '',
  detailedAddress_am: '',
  latitude: '',
  longitude: '',
  working_hour: '',
   contact_phone: '',
  contact_email: '',

  // Step 3: Verification (Pharmacy specific)
  licenseNumber: '',
  licenseDocument: null,
  licenseDocumentName: '',
  pharmacyType: '',
  
  confirmLicensed: false,
  pharmacyLogo: null,
  pharmacyLogoPreview: '',

  // Step 3: Verification (Hospital specific)
  ownershipType: '',
  providesEmergency: false,
  operates24Hours: false,
  hospitalLogo: null,
  hospitalLogoPreview: '',
};

export const useRegistrationStore = create((set, get) => ({
  // Registration type: 'pharmacy' or 'hospital'
  // Registration type: 'pharmacy' or 'hospital'
  registrationType: 'pharmacy',
  
  // Form data
  formData: { ...initialFormData },
  
  // Validation errors per step
  errors: {},
  
  // Loading state for submission
  isSubmitting: false,
  
  // Submission result
  submissionResult: null,

  // Actions
  setRegistrationType: (type) => set({ registrationType: type }),
  
  
  
  updateFormData: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value }
  })),
  
  // Sync entire form data (for step components using local state to prevent focus loss)
  syncFormDataFromLocal: (data) => set({ formData: { ...get().formData, ...data } }),
  
  updateMultipleFields: (fields) => set((state) => ({
    formData: { ...state.formData, ...fields }
  })),
  
  setErrors: (errors) => set({ errors }),
  
  clearErrors: () => set({ errors: {} }),
  
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  setSubmissionResult: (result) => set({ submissionResult: result }),
  
  // Reset entire form
  resetForm: () => set({
    currentStep: 1,
    formData: { ...initialFormData },
    errors: {},
    isSubmitting: false,
    submissionResult: null,
  }),

  // Validation functions
  validateStep1: () => {
    const { formData ,registrationType} = get();
    const errors = {};
    const iAmharic= localStorage.getItem("i18nextLng")==="am";

    const typeLabel = registrationType === 'pharmacy' ? 'Pharmacy' : 'Hospital';

 if (!formData.facilityNameEn?.trim()) {
    errors.facilityNameEn = iAmharic ?   `የ ${typeLabel} ስም ይሙሉ` : `${typeLabel} name (English) is required`;
  } else if (formData.facilityNameEn.trim().length < 3) {
    errors.facilityNameEn = iAmharic ? `የ ${typeLabel} ስም የፊደል ብዛት ከ3 መብለጥ አለበት` : `${typeLabel} name (English) must be at least 3 characters`;
  }

  // Amharic name - REQUIRED
  if (!formData.facilityNameAm?.trim()) {
    errors.facilityNameAm = iAmharic ?   `የ ${typeLabel} ስም ይሙሉ` : `${typeLabel} name in Amharic is required`;
  } else if (formData.facilityNameAm.trim().length < 3) {
    errors.facilityNameAm = iAmharic ? `የ ${typeLabel} ስም የፊደል ብዛት ከ3 መብለጥ አለበት` : `${typeLabel} name in Amharic must be at least 3 characters`;
  }

   

    // Email validation (optional but must be valid if provided)     
    if (formData.contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email)) {
        errors.contact_email = iAmharic ? "ትክክለኛ ኢሜል አድራሻ ያስገቡ" : 'Enter a valid email address';
      }
    }


    // Terms agreement
    if (!formData.agreedToTerms) {
      errors.agreedToTerms = iAmharic ? "ለመቀጠል በደንብና መመሪያዎች መስማማት አለብዎት!" : "You must agree to the terms and privacy policy";
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep2: () => {
    const { formData, registrationType } = get();
    const errors = {};
    const isAmharc = localStorage.getItem("i18nextLng")==="am";

   if (!formData.region_en) {
    errors.region_en = isAmharc ? "ክልል (እንግሊዝኛ) ያስፈልጋል" : 'Region (English) is required';
  }
  if (!formData.region_am) {
    errors.region_am = isAmharc ? "ክልል (አማርኛ) ያስፈልጋል" : 'Region (Amharic) is required';
  }

  // Zone
  if (!formData.zone_en?.trim()) {
    errors.zone_en = isAmharc ? "ዞን / ከተማ (እንግሊዝኛ) ያስፈልጋል" : 'Zone / City (English) is required';
  }
  if (!formData.zone_am?.trim()) {
    errors.zone_am = isAmharc ? "ዞን / ከተማ (አማርኛ) ያስፈልጋል" : 'Zone / City (Amharic) is required';
  }

  // Sub-city
  if (!formData.subCity_en?.trim()) {
    errors.subCity_en = isAmharc ? "ንዑስ ከተማ / ወረዳ (እንግሊዝኛ) ያስፈልጋል" : 'Sub-city / Woreda (English) is required';
  }
  if (!formData.subCity_am?.trim()) {
    errors.subCity_am = isAmharc ? "ንዑስ ከተማ / ወረዳ (አማርኛ) ያስፈልጋል" : 'Sub-city / Woreda (Amharic) is required';
  }
  if (!formData.kebele?.trim()) {
     errors.kebele= isAmharc ? "የቀበሌዎን ቁጥር ያስገቡ" : "enter your kebele";    
  }
  if (!formData.detailedAddress_am) {
    errors.detailedAddress_am = isAmharc ? "አድራሻ ያስገቡ" : 'Address (Amharic) is required';
    }
    if (!formData.detailedAddress_en) {
      errors.detailedAddress_en = isAmharc ? "አድራሻ ያስገቡ በ english" : 'Address (English) is required';
    }
    // Latitude validation
    if (!formData.latitude) {
      errors.latitude = isAmharc ? "latitude ያስገቡ" :'Latitude is required';
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = isAmharc ? "የተሳሳተ latitude ተጠቅመዋል" :'Enter a valid latitude (-90 to 90)';
      }
    }

    // Longitude validation
    if (!formData.longitude) {
      errors.longitude = isAmharc ? "longitude ያስገቡ" : 'Longitude is required';
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = isAmharc ? "longitude በ -180 እና 180 መካከል አስገቡ" : 'Enter a valid longitude (-180 to 180)';
      }
    }
/// validation for working hour here///////////////////

/////////////////////////////////////////
    // Main contact phone validation
    const phoneRegex = /^(09\d{8}|\+2519\d{8})$/;
    const cleanMainPhone = formData.contact_phone.replace(/\s/g, '');
    if (!cleanMainPhone) {
      errors.contact_phone = isAmharc ? "ስልክ ቁጥር ያስገቡ" : 'Main contact phone is required';
    } else if (!phoneRegex.test(cleanMainPhone)) {
      errors.contact_phone = isAmharc ? "ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ" : 'Enter valid Ethiopian phone';
    }

    
    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep3Pharmacy: () => {
   
    const { formData } = get();
    const errors = {};
    const isAmharc = localStorage.getItem("i18nextLng")==="am";

    // License number validation
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = isAmharc ? "ፈቃድ ቁጥር ያስገቡ" : 'License number is required';
    }

    // License document validation
    if (!formData.licenseDocument) {
      errors.licenseDocument = isAmharc ? "ፈቃድ ሰነድ ያስገቡ" : 'License document is required';
    }

    // Pharmacy type validation
    if (!formData.pharmacyType) {
      errors.pharmacyType = isAmharc ? "የፋርማሲውን አይነት ያስገቡ" : 'Pharmacy type is required';
    }

    // Working hours validation
    if (!formData.working_hour.trim()) {
      errors.working_hour = isAmharc ? "የስራ ሰዓት ያስገቡ" : 'Working hours are required';
    }

    // License confirmation
    if (!formData.confirmLicensed) {
      errors.confirmLicensed = isAmharc ? "ፈቃድ እንዳለዎት ማረጋገጥ አለብዎት" : 'You must confirm this is a licensed pharmacy';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep3Hospital: () => {
    const { formData } = get();
    const errors = {};
    const isAmharc = localStorage.getItem("i18nextLng")==="am";

    // License number validation
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = isAmharc ? "ፈቃድ ቁጥር ያስገቡ" : 'License number is required';
    }

    // License document validation
    if (!formData.licenseDocument) {
      errors.licenseDocument = isAmharc ? "ፈቃድ ሰነድ ያስገቡ" : 'License document is required';
    }

    // Ownership type validation
    if (!formData.ownershipType) {
      errors.ownershipType = isAmharc ? "የባለቤትነት አይነት ይምረጡ" : 'Ownership type is required';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));

export default useRegistrationStore;
