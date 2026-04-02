import { create } from 'zustand';

const initialFormData = {
  facilityNameEn: '',
  facilityNameAm: '',
  agreedToTerms: false,

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
  contact_phone: '',
  contact_email: '',

  licenseNumber: '',
  licenseDocument: null,
  licenseDocumentName: '',
  pharmacyType: '',
  confirmLicensed: false,
  pharmacyLogo: null,
  pharmacyLogoPreview: '',

  ownershipType: '',
  providesEmergency: false,
  operates24Hours: false,
  hospitalLogo: null,
  hospitalLogoPreview: '',
};

export const useRegistrationStore = create((set, get) => ({
  registrationType: 'pharmacy',
  formData: { ...initialFormData },
  errors: {},
  isSubmitting: false,
  submissionResult: null,

  setRegistrationType: (type) => set({ registrationType: type }),

  updateFormData: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value }
  })),

  syncFormDataFromLocal: (data) => set({ formData: { ...get().formData, ...data } }),

  updateMultipleFields: (fields) => set((state) => ({
    formData: { ...state.formData, ...fields }
  })),

  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmissionResult: (result) => set({ submissionResult: result }),

  resetForm: () => set({
    currentStep: 1,
    formData: { ...initialFormData },
    errors: {},
    isSubmitting: false,
    submissionResult: null,
  }),

  validateStep1: () => {
    const { formData ,registrationType} = get();
    const errors = {};

    const typeLabel = registrationType === 'pharmacy' ? 'Pharmacy' : 'Hospital';

    if (!formData.facilityNameEn?.trim()) {
      errors.facilityNameEn = t('errors.facilityNameEnRequired', { type: typeLabel });
    } else if (formData.facilityNameEn.trim().length < 3) {
      errors.facilityNameEn = t('errors.facilityNameEnMin', { type: typeLabel });
    }

    if (!formData.facilityNameAm?.trim()) {
      errors.facilityNameAm = t('errors.facilityNameAmRequired', { type: typeLabel });
    } else if (formData.facilityNameAm.trim().length < 3) {
      errors.facilityNameAm = t('errors.facilityNameAmMin', { type: typeLabel });
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = t('errors.invalidEmail');
      }
    }

    if (!formData.agreedToTerms) {
      errors.agreedToTerms = t('errors.mustAgree');
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep2: () => {
    const { formData } = get();
    const errors = {};

    if (!formData.region_en) {
      errors.region_en = t('errors.regionEnRequired');
    }
    if (!formData.region_am) {
      errors.region_am = t('errors.regionAmRequired');
    }

    if (!formData.zone_en?.trim()) {
      errors.zone_en = t('errors.zoneEnRequired');
    }
    if (!formData.zone_am?.trim()) {
      errors.zone_am = t('errors.zoneAmRequired');
    }

    if (!formData.subCity_en?.trim()) {
      errors.subCity_en = t('errors.subCityEnRequired');
    }
    if (!formData.subCity_am?.trim()) {
      errors.subCity_am = t('errors.subCityAmRequired');
    }

    if (!formData.kebele?.trim()) {
      errors.kebele = t('errors.kebeleRequired');
    }

    if (!formData.detailedAddress_am) {
      errors.detailedAddress_am = t('errors.addressAmRequired');
    }

    if (!formData.detailedAddress_en) {
      errors.detailedAddress_en = t('errors.addressEnRequired');
    }

    if (!formData.latitude) {
      errors.latitude = t('errors.latitudeRequired');
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = t('errors.latitudeInvalid');
      }
    }

    if (!formData.longitude) {
      errors.longitude = t('errors.longitudeRequired');
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitude = t('errors.longitudeInvalid');
      }
    }

    const phoneRegex = /^(09\d{8}|\+2519\d{8})$/;
    const cleanMainPhone = formData.mainContactPhone.replace(/\s/g, '');
    if (!cleanMainPhone) {
      errors.mainContactPhone = t('errors.phoneRequired');
    } else if (!phoneRegex.test(cleanMainPhone)) {
      errors.mainContactPhone = t('errors.phoneInvalid');
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep3Pharmacy: () => {
    const { formData } = get();
    const errors = {};

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = t('errors.licenseRequired');
    }

    if (!formData.licenseDocument) {
      errors.licenseDocument = t('errors.licenseDocRequired');
    }

    if (!formData.pharmacyType) {
      errors.pharmacyType = t('errors.pharmacyTypeRequired');
    }

    if (!formData.workingHour.trim()) {
      errors.workingHour = t('errors.workingHourRequired');
    }

    if (!formData.confirmLicensed) {
      errors.confirmLicensed = t('errors.confirmLicensed');
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },

  validateStep3Hospital: () => {
    const { formData } = get();
    const errors = {};

    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = t('errors.licenseRequired');
    }

    if (!formData.licenseDocument) {
      errors.licenseDocument = t('errors.licenseDocRequired');
    }

    if (!formData.ownershipType) {
      errors.ownershipType = t('errors.ownershipRequired');
    }

    set({ errors });
    return Object.keys(errors).length === 0;
  },
}));

export default useRegistrationStore;