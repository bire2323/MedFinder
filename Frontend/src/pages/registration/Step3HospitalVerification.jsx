/**
 * Step 3: Hospital Verification
 * Uses local state for text inputs to prevent focus loss
 */
import React, { useRef, useState, useEffect } from 'react';
import { useRegistrationStore } from '../../store/registrationStore';
import { 
  FileText, 
  Upload, 
  Clock,
  ArrowLeft,
  ArrowRight,
  Building2,
  Image,
  X,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

// Ownership types
const OWNERSHIP_TYPES = [
  { value: '', label: 'Select Ownership Type' },
  { value: 'public', label: 'Public / Government' },
  { value: 'private', label: 'Private' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'faith_based', label: 'Faith-based' },
];

const Step3HospitalVerification = () => {
  const { formData, errors, updateFormData, syncFormDataFromLocal, nextStep, prevStep, validateStep3Hospital } = useRegistrationStore();

  const [localData, setLocalData] = useState({ licenseNumber: '', ownershipType: '', providesEmergency: false, operates24Hours: false });
  const licenseInputRef = useRef(null);
  const logoInputRef = useRef(null);

  useEffect(() => {
    setLocalData({
      licenseNumber: formData.licenseNumber || '',
      ownershipType: formData.ownershipType || '',
      providesEmergency: formData.providesEmergency || false,
      operates24Hours: formData.operates24Hours || false,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = (e) => {
    e.preventDefault();
    syncFormDataFromLocal(localData);
    if (validateStep3Hospital()) nextStep();
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  // Handle license document upload
  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image (JPG, PNG, GIF) or PDF file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
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
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload an image file (JPG, PNG, GIF, WebP).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Logo file size must be less than 2MB.');
        return;
      }
      updateFormData('hospitalLogo', file);
      const previewUrl = URL.createObjectURL(file);
      updateFormData('hospitalLogoPreview', previewUrl);
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
    if (formData.hospitalLogoPreview) {
      URL.revokeObjectURL(formData.hospitalLogoPreview);
    }
    updateFormData('hospitalLogo', null);
    updateFormData('hospitalLogoPreview', '');
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Toggle switch component
  const ToggleSwitch = ({ id, label, description, checked, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-white">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
      </label>
    </div>
  );

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
            License Number
            <span className="text-red-500">*</span>
          </label>
          <input
            id="licenseNumber"
            type="text"
            value={localData.licenseNumber}
            onChange={handleChange('licenseNumber')}
            placeholder="e.g., HO-1234-ETH"
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
              bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-0
              ${errors.licenseNumber 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'
              }
            `}
          />
          {errors.licenseNumber && (
            <p className="text-xs text-red-500">{errors.licenseNumber}</p>
          )}
        </div>

        {/* License Document Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Upload size={16} className="text-blue-500" />
            License Document
            <span className="text-red-500">*</span>
          </label>
          
          {formData.licenseDocument ? (
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
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
                ${errors.licenseDocument 
                  ? 'border-red-400 bg-red-50/50 dark:bg-red-900/10' 
                  : 'border-gray-400 dark:border-gray-500'
                }
              `}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload license document
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports: JPG, PNG, GIF, PDF (max 5MB)
              </p>
            </div>
          )}
          <input
            ref={licenseInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleLicenseUpload}
            className="hidden"
          />
          {errors.licenseDocument && (
            <p className="text-xs text-red-500">{errors.licenseDocument}</p>
          )}
        </div>

        {/* Ownership Type */}
        <div className="space-y-2">
          <label 
            htmlFor="ownershipType" 
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            <Building2 size={16} className="text-blue-500" />
            Ownership Type
            <span className="text-red-500">*</span>
          </label>
          <select
            id="ownershipType"
            value={localData.ownershipType}
            onChange={handleChange('ownershipType')}
            className={`
              w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
              bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white
              focus:outline-none focus:ring-0 appearance-none cursor-pointer
              ${errors.ownershipType 
                ? 'border-red-400 focus:border-red-500' 
                : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'
              }
            `}
          >
            {OWNERSHIP_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.ownershipType && (
            <p className="text-xs text-red-500">{errors.ownershipType}</p>
          )}
        </div>

        {/* Service Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Stethoscope size={16} className="text-blue-500" />
            Service Options
          </h3>
          
          <ToggleSwitch
            id="providesEmergency"
            label="Emergency Services"
            description="Hospital provides emergency medical services"
            checked={localData.providesEmergency}
            onChange={handleChange('providesEmergency')}
            icon={AlertCircle}
          />
          
          <ToggleSwitch
            id="operates24Hours"
            label="24/7 Operation"
            description="Hospital operates round the clock"
            checked={localData.operates24Hours}
            onChange={handleChange('operates24Hours')}
            icon={Clock}
          />
        </div>

        {/* Hospital Logo Upload */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Image size={16} className="text-blue-500" />
            Hospital Logo
            <span className="text-xs text-gray-400 font-normal">(optional)</span>
          </label>
          
          {formData.hospitalLogoPreview ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-400 dark:border-gray-500">
              <img
                src={formData.hospitalLogoPreview}
                alt="Logo preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  Logo uploaded
                </p>
                <p className="text-xs text-gray-500">
                  {formData.hospitalLogo?.name}
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
                Click to upload logo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, GIF, WebP (max 2MB)
              </p>
            </div>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="
            flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
            bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-all duration-200
          "
        >
          <ArrowLeft size={18} />
          Back
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
          Review & Submit
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default Step3HospitalVerification;
