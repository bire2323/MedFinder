/**
 * Step 3: Pharmacy Verification
 * Uses local state for text inputs to prevent focus loss
 */
import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRegistrationStore } from '../../store/registrationStore';
import { FileText, Upload, Clock, ArrowLeft, ArrowRight, ShieldCheck, Building2, Image, X } from 'lucide-react';
import handleKeyDown from '../../hooks/handleKeyDown';
const PHARMACY_TYPES = [
  { value: '', label: 'Select Pharmacy Type' },
  { value: 'community', label: 'Community Pharmacy' },
  { value: 'hospital_based', label: 'Hospital-based Pharmacy' },
  { value: 'wholesale', label: 'Wholesale Pharmacy' },
  { value: 'import', label: 'Import Pharmacy' },
];

import { useTranslation } from 'react-i18next';

const Step3PharmacyVerification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { type } = useParams();
  const { formData, errors, updateFormData, syncFormDataFromLocal, validateStep3Pharmacy } = useRegistrationStore();

  const PHARMACY_TYPES = [
    { value: '', label: t('Registration.SelectType', { type: t('Registration.PharmacyType') }) },
    { value: 'community', label: t('Registration.PharmacyTypes.Community') },
    { value: 'hospital_based', label: t('Registration.PharmacyTypes.HospitalBased') },
    { value: 'wholesale', label: t('Registration.PharmacyTypes.Wholesale') },
    { value: 'import', label: t('Registration.PharmacyTypes.Import') },
  ];

  const [localData, setLocalData] = useState({ licenseNumber: '', pharmacyType: '', workingHour: '', confirmLicensed: false });
  const licenseInputRef = useRef(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    setLocalData({
      licenseNumber: formData.licenseNumber || '',
      pharmacyType: formData.pharmacyType || '',
      workingHour: formData.workingHour || '',
      confirmLicensed: formData.confirmLicensed || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    syncFormDataFromLocal(localData);
    if (validateStep3Pharmacy()) {
      navigate(`/register/${type}/review`);
    } else {
      console.log('hrno');
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  // Handle license document upload
  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(t('Registration.UploadErrorType'));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('Registration.UploadErrorSize'));
        return;
      }
      updateFormData('licenseDocument', file);
      updateFormData('licenseDocumentName', file.name);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (images only for logo)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(t('Registration.LogoErrorType'));
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(t('Registration.LogoErrorSize'));
        return;
      }
      updateFormData('pharmacyLogo', file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      updateFormData('pharmacyLogoPreview', previewUrl);
    }
  };

  // Remove uploaded file
  const removeLicenseDocument = () => {
    updateFormData('licenseDocument', null);
    updateFormData('licenseDocumentName', '');
    if (licenseInputRef.current) {
      licenseInputRef.current.value = '';
    }
  };

  const removeLogo = () => {
    if (formData.pharmacyLogoPreview) URL.revokeObjectURL(formData.pharmacyLogoPreview);
    updateFormData('pharmacyLogo', null);
    updateFormData('pharmacyLogoPreview', '');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleNext} className="p-6 md:p-8">
      <div className="space-y-6">
        {/* License Number */}
        <div className="space-y-2">
          <label
            htmlFor="licenseNumber"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            <FileText size={16} className="text-blue-500" />
            {t('Registration.LicenseNumber')}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="licenseNumber"
            type="text"
            onKeyDown={handleKeyDown}
            value={localData.licenseNumber}
            onChange={handleChange('licenseNumber')}
            placeholder="e.g., PH-1234-ETH"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 ${errors.licenseNumber ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'}`}
          />
          {errors.licenseNumber && (
            <p className="text-xs text-red-500">{errors.licenseNumber}</p>
          )}
        </div>

        {/* License Document Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Upload size={16} className="text-blue-500" />
            {t('Registration.LicenseDoc')}
            <span className="text-red-500">*</span>
          </label>

          {formData.licenseDocument ? (
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-gray-400 dark:border-gray-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                  <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {formData.licenseDocumentName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(formData.licenseDocument.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeLicenseDocument}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                aria-label="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => licenseInputRef.current?.click()}
              className={`
                p-8 border-2 border-dashed rounded-xl text-center cursor-pointer
                transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50
                ${errors.licenseDocument ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' : 'border-gray-400 dark:border-gray-500'}
              `}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Registration.ClickUpload', { type: t('Registration.LicenseDoc') })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('Registration.UploadSupports')}
              </p>
            </div>
          )}
          <input
            ref={licenseInputRef}
            type="file"
            onKeyDown={handleKeyDown}
            accept="image/*,.pdf"
            onChange={handleLicenseUpload}
            className="hidden"
          />
          {errors.licenseDocument && (
            <p className="text-xs text-red-500">{errors.licenseDocument}</p>
          )}
        </div>

        {/* Pharmacy Type */}
        <div className="space-y-2">
          <label
            htmlFor="pharmacyType"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            <Building2 size={16} className="text-blue-500" />
            {t('Registration.PharmacyType')}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="pharmacyType"
            value={localData.pharmacyType}
            onChange={handleChange('pharmacyType')}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-0 appearance-none cursor-pointer ${errors.pharmacyType ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'}`}
          >
            {PHARMACY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.pharmacyType && (
            <p className="text-xs text-red-500">{errors.pharmacyType}</p>
          )}
        </div>

        {/* Working Hours */}
        <div className="space-y-2">
          <label
            htmlFor="workingHours"
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            <Clock size={16} className="text-blue-500" />
            {t('Registration.WorkingHour')}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="workingHour"
            type="text"
            onKeyDown={handleKeyDown}
            value={localData.workingHour}
            onChange={handleChange('workingHour')}
            placeholder="e.g., 08:00 - 20:00 or 24/7"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 ${errors.workingHours ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'}`}
          />
          {errors.workingHours && (
            <p className="text-xs text-red-500">{errors.workingHour}</p>
          )}
        </div>

        {/* Pharmacy Logo Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Image size={16} className="text-blue-500" />
            {t('Registration.Logo')}
          </label>

          {formData.pharmacyLogoPreview ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-400 dark:border-gray-500">
              <img
                src={formData.pharmacyLogoPreview}
                alt="Logo preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {t('Registration.LogoUploaded')}
                </p>
                <p className="text-xs text-gray-500">
                  {formData.pharmacyLogo?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={removeLogo}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                aria-label="Remove logo"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => logoInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-xl text-center cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <Image size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Registration.ClickUpload', { type: t('Registration.Logo') })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t('Registration.LogoSupports')}
              </p>
            </div>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="opacity-0 absolute pointer-events-none"
            name='file'
            required
          />
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-gray-400 dark:border-gray-500">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={localData.confirmLicensed}
                onChange={handleChange('confirmLicensed')}
                className="sr-only peer"
              />
              <div className={`
                w-5 h-5 rounded border-2 transition-all duration-200
                flex items-center justify-center
                peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                ${errors.confirmLicensed ? 'border-red-400' : 'border-gray-400 dark:border-gray-500'} group-hover:border-emerald-400`}>
                {localData.confirmLicensed && (
                  <ShieldCheck size={14} className="text-white" />
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('Registration.ConfirmLicensed', { type: t('Registration.PharmacyType') })}
              <span className="text-red-500"> *</span>
            </span>
          </label>
          {errors.confirmLicensed && (
            <p className="text-xs text-red-500 mt-2 ml-8">
              {errors.confirmLicensed}
            </p>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
            bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-all duration-200
          "
        >
          <ArrowLeft size={18} />
          {t('Registration.Back')}
        </button>
        <button
          type="submit"
          className="
            flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
            bg-gradient-to-r from-blue-500 to-emerald-500 text-white
            hover:from-blue-600 hover:to-emerald-600
            transform hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 shadow-lg hover:shadow-xl
          "
        >
          {t('Registration.ReviewSubmit')}
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default Step3PharmacyVerification;
