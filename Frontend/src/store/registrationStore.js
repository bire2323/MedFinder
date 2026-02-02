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
 
  email: '',
 
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
  workingHour: '',
  mainContactPhone: '',

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
  // Current step (1-4)
  currentStep: 1,
  
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
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({ 
    currentStep: Math.min(state.currentStep + 1, 4) 
  })),
  
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(state.currentStep - 1, 1) 
  })),
  
  goToStep: (step) => set({ currentStep: step }),
  
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

    const typeLabel = registrationType === 'pharmacy' ? 'Pharmacy' : 'Hospital';

 if (!formData.facilityNameEn?.trim()) {
    errors.facilityNameEn = `${typeLabel} name (English) is required`;
  } else if (formData.facilityNameEn.trim().length < 3) {
    errors.facilityNameEn = `${typeLabel} name (English) must be at least 3 characters`;
  }

  // Amharic name - REQUIRED
  if (!formData.facilityNameAm?.trim()) {
    errors.facilityNameAm = `${typeLabel} name in Amharic is required`;
  } else if (formData.facilityNameAm.trim().length < 3) {
    errors.facilityNameAm = `${typeLabel} name in Amharic must be at least 3 characters`;
  }

   

    // Email validation (optional but must be valid if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      }
    }


    // Terms agreement
    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and privacy policy';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep2: () => {
    const { formData, registrationType } = get();
    const errors = {};

   if (!formData.region_en) {
    errors.region_en = 'Region (English) is required';
  }
  if (!formData.region_am) {
    errors.region_am = 'ክልል (አማርኛ) ያስፈልጋል';
  }

  // Zone
  if (!formData.zone_en?.trim()) {
    errors.zone_en = 'Zone / City (English) is required';
  }
  if (!formData.zone_am?.trim()) {
    errors.zone_am = 'ዞን / ከተማ (አማርኛ) ያስፈልጋል';
  }

  // Sub-city
  if (!formData.subCity_en?.trim()) {
    errors.subCity_en = 'Sub-city / Woreda (English) is required';
  }
  if (!formData.subCity_am?.trim()) {
    errors.subCity_am = 'ንዑስ ከተማ / ወረዳ (አማርኛ) ያስፈልጋል';
  }
  if (!formData.kebele?.trim()) {
     errors.kebele= "enter your kebele";    
  }
  if (!formData.detailedAddress_am) {
    errors.detailedAddress_am ='አድራሻ ያስገቡ'
    }
    if (!formData.detailedAddress_en) {
      errors.detailedAddress_en = "enter address litrally"
    }
    // Latitude validation
    if (!formData.latitude) {
      errors.latitude = 'Latitude is required';
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Enter a valid latitude (-90 to 90)';
      }
    }

    // Longitude validation
    if (!formData.longitude) {
      errors.longitude = 'Longitude is required';
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = 'Enter a valid longitude (-180 to 180)';
      }
    }
/// validation for working hour here///////////////////

/////////////////////////////////////////
    // Main contact phone validation
    const phoneRegex = /^(09\d{8}|\+2519\d{8})$/;
    const cleanMainPhone = formData.mainContactPhone.replace(/\s/g, '');
    if (!cleanMainPhone) {
      errors.mainContactPhone = 'Main contact phone is required';
    } else if (!phoneRegex.test(cleanMainPhone)) {
      errors.mainContactPhone = 'Enter valid Ethiopian phone';
    }

    
    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep3Pharmacy: () => {
   
    const { formData } = get();
    const errors = {};

    // License number validation
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    }

    // License document validation
    if (!formData.licenseDocument) {
      errors.licenseDocument = 'License document is required';
    }

    // Pharmacy type validation
    if (!formData.pharmacyType) {
      errors.pharmacyType = 'Pharmacy type is required';
    }

    // Working hours validation
    if (!formData.workingHour.trim()) {
      errors.workingHour = 'Working hours are required';
    }

    // License confirmation
    if (!formData.confirmLicensed) {
      errors.confirmLicensed = 'You must confirm this is a licensed pharmacy';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep3Hospital: () => {
    const { formData } = get();
    const errors = {};

    // License number validation
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    }

    // License document validation
    if (!formData.licenseDocument) {
      errors.licenseDocument = 'License document is required';
    }

    // Ownership type validation
    if (!formData.ownershipType) {
      errors.ownershipType = 'Ownership type is required';
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));

export default useRegistrationStore;
