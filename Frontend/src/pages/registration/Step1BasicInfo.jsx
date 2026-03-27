/**
 * Step 1: Basic Information
 * Collects facility name, phone, email, password, and terms agreement
 * Uses local state to prevent input focus loss on re-renders
 */
import React, { useState, useEffect } from 'react';
import { useRegistrationStore } from '../../store/registrationStore';
import handleKeyDown from '../../hooks/handleKeyDown';
import { useNavigate } from 'react-router-dom';
import {
  Building2,

  Mail,
  ArrowLeft,
  ArrowRight,
  FileCheck,
  Globe
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

const Step1BasicInfo = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    formData: storeFormData,
    errors,
    syncFormDataFromLocal,
    nextStep,
    validateStep1,
    registrationType
  } = useRegistrationStore();

  // Local state to prevent focus loss - only sync to store on Next
  const [localData, setLocalData] = useState({
    facilityNameEn: '',
    facilityNameAm: '',

    email: '',

    agreedToTerms: false,
  });


  // Initialize from store when component mounts (empty deps = run once on mount)
  useEffect(() => {
    setLocalData({
      facilityNameEn: storeFormData.facilityNameEn || '',
      facilityNameAm: storeFormData.facilityNameAm || '',

      email: storeFormData.email || '',

      agreedToTerms: storeFormData.agreedToTerms || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = (e) => {
    e.preventDefault();

    syncFormDataFromLocal(localData);
    if (validateStep1()) {

      nextStep();
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleNext} className="p-6 md:p-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-3 justify-between mt-4 ">
          {/* English Name - REQUIRED */}
          <div className="space-y-2  w-full">
            <label htmlFor="facilityName" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Building2 size={16} className="text-blue-500" />
              {registrationType === 'pharmacy' ? t('Registration.PharmacyNameEn') : t('Registration.HospitalNameEn')}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="facilityName"
              type="text"
              onKeyDown={handleKeyDown}
              value={localData.facilityNameEn}
              onChange={handleChange('facilityNameEn')}
              placeholder={t('Registration.EnterNameEn', { type: registrationType === 'pharmacy' ? t('Registration.PharmacyName') : t('Registration.HospitalName') })}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 ${errors.facilityName ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'}`}
              aria-describedby={errors.facilityNameEn ? 'facilityName-error' : undefined}
            />
            {errors.facilityNameEn && (
              <p id="facilityName-error" className="text-xs text-red-500 mt-1">
                {errors.facilityNameEn}
              </p>
            )}
          </div>

          {/* Amharic Name - REQUIRED */}
          <div className="space-y-2 w-full">
            <label htmlFor="facilityNameAm" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Globe size={16} className="text-green-500" />
              {registrationType === 'pharmacy' ? t('Registration.PharmacyNameAm') : t('Registration.HospitalNameAm')}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="facilityNameAm"
              type="text"

              onKeyDown={handleKeyDown}
              value={localData.facilityNameAm}
              onChange={handleChange('facilityNameAm')}
              placeholder={t('Registration.EnterNameAm', { type: registrationType === 'pharmacy' ? t('Registration.PharmacyName') : t('Registration.HospitalName') })}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 ${errors.facilityNameAm ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-green-500'}`}
              dir="ltr" // Right-to-left writing direction for Amharic
              aria-describedby={errors.facilityNameAm ? 'facilityNameAm-error' : undefined}
            />
            {errors.facilityNameAm && (
              <p id="facilityNameAm-error" className="text-xs text-red-500 mt-1">
                {errors.facilityNameAm}
              </p>
            )}
          </div>
        </div>



        <div className="space-y-2">
          <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <Mail size={16} className="text-blue-500" />
            {t('Registration.EmailAddress')}<span className="text-xs text-gray-400 font-normal"></span>
          </label>
          <input
            id="email"
            type="email"
            onKeyDown={handleKeyDown}
            value={localData.email}
            onChange={handleChange('email')}
            placeholder="contact@example.com"
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'}`}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <p id="email-error" className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>



        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input type="checkbox" checked={localData.agreedToTerms} onChange={handleChange('agreedToTerms')} className="sr-only peer" aria-describedby={errors.agreedToTerms ? 'terms-error' : undefined} />
              <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center peer-checked:bg-blue-500 peer-checked:border-blue-500 ${errors.agreedToTerms ? 'border-red-400' : 'border-gray-400 dark:border-gray-500'} group-hover:border-blue-400`}>
                {localData.agreedToTerms && <FileCheck size={14} className="text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('Registration.AgreeTerms')}
              <span className="text-red-500"> *</span>
            </span>
          </label>
          {errors.agreedToTerms && <p id="terms-error" className="text-xs text-red-500 ml-8">{errors.agreedToTerms}</p>}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => { navigate(-1) }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
        >
          <ArrowLeft size={18} /> {t('Registration.Exit')}
        </button>
        <button type="submit" className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl">
          {t('Registration.NextStep')}
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
};

export default Step1BasicInfo;
