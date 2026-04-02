/**
 * Multi-step Registration Wizard
 * Fixed: Progress bar now correctly updates when step changes
 */
import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useRegistrationStore } from '../../store/registrationStore';
import { Check, Building2, Pill } from 'lucide-react';
import { useTranslation } from "react-i18next";

const RegistrationWizard = () => {
  const { t } = useTranslation();
  const { type } = useParams();                    // We only need 'type' from params
  const navigate = useNavigate();
  const location = useLocation();

  const { setRegistrationType, resetForm } = useRegistrationStore();

  const registrationType = type || 'pharmacy';

  // Sync store with route param
  useEffect(() => {
    setRegistrationType(registrationType);
  }, [registrationType, setRegistrationType]);

  // Step definitions
  const steps = useMemo(() => [
    { id: 'basic-info', number: 1, title: t('Registration.Step1'), description: t('Registration.AccountDetails') },
    { id: 'location-info', number: 2, title: t('Registration.Step2'), description: t('Registration.AddressContact') },
    { id: 'verification-info', number: 3, title: t('Registration.Step3'), description: t('Registration.LicenseDocs') },
    { id: 'review', number: 4, title: t('Registration.Step4'), description: t('Registration.ConfirmSubmit') },
  ], [t]);

  // FIXED: Better way to detect current step from current URL
  const currentStep = useMemo(() => {
    const pathname = location.pathname.toLowerCase();

    if (pathname.includes('success')) return 5;           // Success page (hide progress)
    if (pathname.includes('review')) return 4;
    if (pathname.includes('verification-info')) return 3;
    if (pathname.includes('location-info')) return 2;
    return 1;                                             // Default to step 1
  }, [location.pathname]);

  const currentStepInfo = steps.find(s => s.number === currentStep) || steps[0];

  // Handle invalid type and missing step
  useEffect(() => {
    if (type !== 'pharmacy' && type !== 'hospital') {
      navigate('/register/pharmacy/basic-info', { replace: true });
      return;
    }

    // Auto redirect to step-1 if no step is specified
    if (!location.pathname.includes('basic-info') &&
      !location.pathname.includes('location-info') &&
      !location.pathname.includes('verification-info') &&
      !location.pathname.includes('review') &&
      !location.pathname.includes('success')) {
      navigate(`/register/${registrationType}/basic-info`, { replace: true });
    }
  }, [type, location.pathname, navigate, registrationType]);

  // Hide progress bar on success page
  const showProgress = currentStep !== 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
       {currentStep !== 5 && 
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white mb-4 shadow-lg">
            {registrationType === 'pharmacy' ? <Pill size={32} /> : <Building2 size={32} />}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {registrationType === 'pharmacy'
              ? t('Registration.PharmacyRegistration')
              : t('Registration.HospitalRegistration')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('Registration.RegisterFacility')}
          </p>
        </div>}

        {/* Progress Bar */}
        {showProgress && (
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
              <motion.div
                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500"
                initial={false}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />

              <div className="relative flex justify-between">
                {steps.map((s) => (
                  <div key={s.id} className="flex flex-col items-center">
                    <motion.div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                        transition-all duration-300 z-10 border-2 border-white dark:border-gray-800
                        ${currentStep > s.number
                          ? 'bg-emerald-500 text-white'
                          : currentStep === s.number
                            ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }
                      `}
                      animate={{ scale: currentStep === s.number ? 1.08 : 1 }}
                    >
                      {currentStep > s.number ? <Check size={20} /> : s.number}
                    </motion.div>

                    <div className="mt-3 text-center hidden sm:block">
                      <p className={`text-xs font-semibold ${currentStep >= s.number ? 'text-gray-800 dark:text-white' : 'text-gray-400'
                        }`}>
                        {s.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {s.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Step Indicator */}
            <div className="sm:hidden text-center mt-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                Step {currentStep} of {steps.length}: {currentStepInfo.title}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}           // This triggers animation on route change
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
          {t('Registration.TermsAgree')}<br />
          {t('Registration.ReviewNote')}
        </p>
      </div>
    </div>
  );
};

export default RegistrationWizard;