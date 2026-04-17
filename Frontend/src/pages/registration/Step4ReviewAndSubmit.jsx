/**
 * Step 4: Review and Submit
 * Shows all entered data for review with edit options
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../store/registrationStore';
import { apiRegisterPharmacy, apiRegisterHospital } from '../../api/registration';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Edit2,
  ArrowLeft,
  Send,
  Loader2,
  Shield,
  Globe,
  AlertCircle,
  CheckCircle,
  TimerIcon
} from 'lucide-react';

// Region labels for display - will use t() function
const getRegionLabel = (regionKey, t) => {
  const regionMap = {
    addis_ababa: t('review.regions.addis_ababa'),
    afar: t('review.regions.afar'),
    amhara: t('review.regions.amhara'),
    benishangul_gumuz: t('review.regions.benishangul_gumuz'),
    dire_dawa: t('review.regions.dire_dawa'),
    gambela: t('review.regions.gambela'),
    harari: t('review.regions.harari'),
    oromia: t('review.regions.oromia'),
    sidama: t('review.regions.sidama'),
    snnpr: t('review.regions.snnpr'),
    somali: t('review.regions.somali'),
    south_west: t('review.regions.south_west'),
    tigray: t('review.regions.tigray'),
  };
  return regionMap[regionKey] || regionKey;
};

const getPharmacyTypeLabel = (typeKey, t) => {
  const typeMap = {
    community: t('review.pharmacyTypes.community'),
    hospital_based: t('review.pharmacyTypes.hospital_based'),
    wholesale: t('review.pharmacyTypes.wholesale'),
    import: t('review.pharmacyTypes.import'),
  };
  return typeMap[typeKey] || typeKey;
};

const getOwnershipTypeLabel = (typeKey, t) => {
  const typeMap = {
    public: t('review.ownershipTypes.public'),
    private: t('review.ownershipTypes.private'),
    ngo: t('review.ownershipTypes.ngo'),
    faith_based: t('review.ownershipTypes.faith_based'),
  };
  return typeMap[typeKey] || typeKey;
};

const Step4ReviewAndSubmit = () => {
  const { t } = useTranslation();
  const { type } = useParams();
  const navigate = useNavigate();
  const {
    formData,
    registrationType,
    isSubmitting,
    setIsSubmitting,
    setSubmissionResult
  } = useRegistrationStore();

  const [submitError, setSubmitError] = useState(null);
  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const apiCall = registrationType === 'pharmacy'
        ? apiRegisterPharmacy
        : apiRegisterHospital;
      
    try {
      const response = await apiCall(formData);

  // Success path
       if (response.success) {
         setSubmissionResult({ success: true, data: response });
         navigate(`/register/${type}/success`);
  } else if (response.code === 'ALREADY_REGISTERED_AGENT') {
    setSubmitError(t('review.messages.alreadyRegisteredAgent'));
  } else {
    setSubmitError(t('review.messages.tryAgain'));
  }
} catch (error) {
  // For fetch wrappers that throw on 4xx/5xx
  console.error(error);
  if (error?.code === 'ALREADY_REGISTERED_AGENT') {
    setSubmitError(t('review.messages.alreadyRegisteredAgent'));
  } else {
    setSubmitError(t('review.messages.tryAgain'));
  }
} finally {
  setIsSubmitting(false);
}
  }catch(error){
    console.log("ddddddddddddd");
  }finally {
  setIsSubmitting(false);
  }
};

  // Review section component
  const ReviewSection = ({ title, icon: Icon, step, children }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Icon size={18} className="text-blue-500" />
          {title}
        </h3>
        <button
          type="button"
          onClick={() => {
            if (step == 1) {
              navigate(`/register/${type}/basic-info`);
            } else if (step == 2) {
              navigate(`/register/${type}/location-info`);
            } else if (step == 3) {
              navigate(`/register/${type}/verification-info`);
            } else if (step == 4) {
              navigate(`/register/${type}/review`);
            } else {
              navigate(`/register/${type}/success`);
            }
          }}
          className="
            flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg
            text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30
            hover:bg-blue-100 dark:hover:bg-blue-900/50
            transition-colors
          "
        >
          <Edit2 size={12} />
          {t('review.buttons.edit')}
        </button>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  // Info item component
  const InfoItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3">
      {Icon && <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-white break-words">
          {value || <span className="text-gray-400 italic">{t('review.messages.notProvided')}</span>}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
          <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {t('review.title')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('review.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Information */}
        <ReviewSection title={t('review.basicInfo.title')} icon={Building2} step={1}>
          <InfoItem
            label={registrationType === 'pharmacy' ? t('review.basicInfo.pharmacyName') : t('review.basicInfo.hospitalName')}
            value={formData.facilityNameEn}
            icon={Building2}
          />
          <InfoItem
            label={registrationType === 'pharmacy' ? t('review.basicInfo.pharmacyNameAm') : t('review.basicInfo.hospitalNameAm')}
            value={formData.facilityNameAm}
            icon={Building2}
          />
          <InfoItem label={t('review.basicInfo.email')} value={formData.contact_email} icon={Mail} />
        </ReviewSection>

        {/* Location & Contact */}
        <ReviewSection title={t('review.location.title')} icon={MapPin} step={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoItem
              label={t('review.location.region')}
              value={getRegionLabel(formData.region_en, t)}
              icon={Globe}
            />
            <InfoItem
              label={t('review.location.regionAm')}
              value={getRegionLabel(formData.region_am, t)}
              icon={Globe}
            />
            <InfoItem label={t('review.location.zoneCity')} value={formData.zone_en} icon={MapPin} />
            <InfoItem label={t('review.location.zoneCityAm')} value={formData.zone_am} icon={MapPin} />
            <InfoItem label={t('review.location.subCity')} value={formData.subCity_en} icon={MapPin} />
            <InfoItem label={t('review.location.subCityAm')} value={formData.subCity_am} icon={MapPin} />
            <InfoItem label={t('review.location.kebele')} value={formData.kebele} icon={MapPin} />
          </div>
          <InfoItem
            label={t('review.location.detailedAddress')}
            value={formData.detailedAddress_en}
            icon={MapPin}
          />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <InfoItem label={t('review.location.latitude')} value={formData.latitude} />
            <InfoItem label={t('review.location.longitude')} value={formData.longitude} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <InfoItem
              label={t('review.location.workingHour')}
              value={formData.working_hour}
              icon={TimerIcon}
            />
            <InfoItem
              label={registrationType === 'hospital' ? t('review.location.emergencyPhone') : t('review.location.alternatePhone')}
              value={formData.contact_phone}
              icon={Phone}
            />
          </div>
        </ReviewSection>

        {/* Verification Info */}
        <ReviewSection title={t('review.verification.title')} icon={FileText} step={3}>
          <InfoItem
            label={t('review.verification.licenseNumber')}
            value={formData.licenseNumber}
            icon={FileText}
          />
          <InfoItem
            label={t('review.verification.licenseDocument')}
            value={formData.licenseDocumentName}
            icon={FileText}
          />

          {registrationType === 'pharmacy' ? (
            <>
              <InfoItem
                label={t('review.verification.pharmacyType')}
                value={getPharmacyTypeLabel(formData.pharmacyType, t)}
                icon={Building2}
              />
              <InfoItem
                label={t('review.verification.workingHours')}
                value={formData.working_hour}
                icon={Clock}
              />
              {formData.pharmacyLogoPreview && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={formData.pharmacyLogoPreview}
                    alt={t('review.verification.logoUploaded')}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('review.verification.logoUploaded')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <InfoItem
                label={t('review.verification.ownershipType')}
                value={getOwnershipTypeLabel(formData.ownershipType, t)}
                icon={Building2}
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${formData.providesEmergency ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('review.verification.emergencyServices')}: {formData.providesEmergency ? t('review.verification.yes') : t('review.verification.no')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${formData.operates24Hours ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('review.verification.operates247')}: {formData.operates24Hours ? t('review.verification.yes') : t('review.verification.no')}
                  </span>
                </div>
              </div>
              {formData.hospitalLogoPreview && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={formData.hospitalLogoPreview}
                    alt={t('review.verification.logoUploaded')}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('review.verification.logoUploaded')}
                  </span>
                </div>
              )}
            </>
          )}
        </ReviewSection>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {t('review.messages.submissionFailed')}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
          className="
            flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
            bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-gray-600
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <ArrowLeft size={18} />
          {t('review.buttons.back')}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="
            flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-bold
            bg-gradient-to-r from-blue-500 to-emerald-500 text-white
            hover:from-blue-600 hover:to-emerald-600
            transform hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 shadow-lg hover:shadow-xl
            disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              {t('review.buttons.submitting')}
            </>
          ) : (
            <>
              <Send size={18} />
              {t('review.buttons.submit')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4ReviewAndSubmit;