/**
 * Step 4: Review and Submit
 * Shows all entered data for review with edit options
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

// Region labels for display
const REGION_LABELS = {
  addis_ababa: 'Addis Ababa',
  afar: 'Afar',
  amhara: 'Amhara',
  benishangul_gumuz: 'Benishangul-Gumuz',
  dire_dawa: 'Dire Dawa',
  gambela: 'Gambela',
  harari: 'Harari',
  oromia: 'Oromia',
  sidama: 'Sidama',
  snnpr: 'SNNPR',
  somali: 'Somali',
  south_west: 'South West Ethiopia',
  tigray: 'Tigray',
};

const PHARMACY_TYPE_LABELS = {
  community: 'Community Pharmacy',
  hospital_based: 'Hospital-based Pharmacy',
  wholesale: 'Wholesale Pharmacy',
  import: 'Import Pharmacy',
};

const OWNERSHIP_TYPE_LABELS = {
  public: 'Public / Government',
  private: 'Private',
  ngo: 'NGO / Non-Profit',
  faith_based: 'Faith-based',
};

const Step4ReviewAndSubmit = () => {
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
      // console.log(formData);
      const response = await apiCall(formData);



      if (response.success) {
        setSubmissionResult({ success: true, data: response });
        navigate(`/register/${type}/success`);
      } else {
        setSubmitError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError('try again.');
    } finally {
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
            console.log(step);
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
          Edit
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
          {value || <span className="text-gray-400 italic">Not provided</span>}
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
          Review Your Information
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Please review all details before submitting
        </p>
      </div>

      <div className="space-y-4">
        {/* Basic Information */}
        <ReviewSection title="Basic Information" icon={Building2} step={1}>
          <InfoItem
            label={registrationType === 'pharmacy' ? 'Pharmacy Name' : 'Hospital Name'}
            value={formData.facilityNameEn}
            icon={Building2}
          />
          <InfoItem
            label={registrationType === 'pharmacy' ? 'Pharmacy Name (በ አማርኛ)' : 'Hospital Name (በ አማርኛ)'}
            value={formData.facilityNameAm}
            icon={Building2}
          />
          <InfoItem label="Email" value={formData.email} icon={Mail} />

        </ReviewSection>

        {/* Location & Contact */}
        <ReviewSection title="Location & Contact" icon={MapPin} step={2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoItem
              label="Region"
              value={REGION_LABELS[formData.region_en] || formData.region}
              icon={Globe}
            />
            <InfoItem
              label="Region (በ አማርኛ)"
              value={REGION_LABELS[formData.region_am] || formData.region}
              icon={Globe}
            />
            <InfoItem label="Zone/City" value={formData.zone_en} icon={MapPin} />
            <InfoItem label="Zone/City (በ አማርኛ)" value={formData.zone_am} icon={MapPin} />
            <InfoItem label="Sub-city/Woreda" value={formData.subCity_en} icon={MapPin} />
            <InfoItem label="Sub-city/Woreda (በ አማርኛ)" value={formData.subCity_am} icon={MapPin} />
            <InfoItem label="Kebele" value={formData.kebele} icon={MapPin} />
          </div>
          <InfoItem
            label="Detailed Address"
            value={formData.detailedAddress}
            icon={MapPin}
          />
          <div className="grid grid-cols-2 gap-3 pt-2">
            <InfoItem label="Latitude" value={formData.latitude} />
            <InfoItem label="Longitude" value={formData.longitude} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <InfoItem
              label="Working Hour"
              value={formData.workingHour}
              icon={TimerIcon}
            />
            <InfoItem
              label={registrationType === 'hospital' ? 'Emergency Phone' : 'Alternate Phone'}
              value={formData.mainContactPhone}
              icon={Phone}
            />
          </div>
        </ReviewSection>

        {/* Verification Info */}
        <ReviewSection title="Verification & License" icon={FileText} step={3}>
          <InfoItem
            label="License Number"
            value={formData.licenseNumber}
            icon={FileText}
          />
          <InfoItem
            label="License Document"
            value={formData.licenseDocumentName}
            icon={FileText}
          />

          {registrationType === 'pharmacy' ? (
            <>
              <InfoItem
                label="Pharmacy Type"
                value={PHARMACY_TYPE_LABELS[formData.pharmacyType] || formData.pharmacyType}
                icon={Building2}
              />
              <InfoItem
                label="Working Hours"
                value={formData.workingHour}
                icon={Clock}
              />
              {formData.pharmacyLogoPreview && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={formData.pharmacyLogoPreview}
                    alt="Pharmacy Logo"
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Logo uploaded
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <InfoItem
                label="Ownership Type"
                value={OWNERSHIP_TYPE_LABELS[formData.ownershipType] || formData.ownershipType}
                icon={Building2}
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${formData.providesEmergency ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Emergency Services: {formData.providesEmergency ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${formData.operates24Hours ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    24/7 Operation: {formData.operates24Hours ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {formData.hospitalLogoPreview && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={formData.hospitalLogoPreview}
                    alt="Hospital Logo"
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Logo uploaded
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
              Submission Failed
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
          Back
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
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit for Admin Approval
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4ReviewAndSubmit;
