/**
 * Multi-step Registration Wizard
 * Main component that orchestrates the registration flow for pharmacies and hospitals
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegistrationStore } from '../../store/registrationStore';
import { Check, Building2, Pill } from 'lucide-react';

// Step components
import Step1BasicInfo from './Step1BasicInfo';
import Step2Location from './Step2Location';
import Step3PharmacyVerification from './Step3PharmacyVerification';
import Step3HospitalVerification from './Step3HospitalVerification';
import Step4ReviewAndSubmit from './Step4ReviewAndSubmit';
import SuccessScreen from './SuccessScreen';
import { useTranslation } from "react-i18next";

/**
 * RegistrationWizard component
 * @param {Object} props
 * @param {'pharmacy' | 'hospital'} props.registrationType - Type of registration
 */
const RegistrationWizard = ({ registrationType = 'pharmacy' }) => {
  const { t } = useTranslation();
  const { 
    currentStep, 
    setRegistrationType, 
    resetForm,
    submissionResult 
  } = useRegistrationStore();

  // Set registration type on mount
  useEffect(() => {
    setRegistrationType(registrationType);
    // Reset form when component mounts with new type
    resetForm();
    setRegistrationType(registrationType);
  }, [registrationType, setRegistrationType, resetForm]);

  // Step definitions
  const steps = [
    { number: 1, title: t('Registration.Step1'), description: 'Account details' },
    { number: 2, title: t('Registration.Step2'), description: 'Address & contact' },
    { number: 3, title: t('Registration.Step3'), description: 'License & documents' },
    { number: 4, title: t('Registration.Step4'), description: 'Confirm & submit' },
  ];

  // Show success screen if submitted
  if (submissionResult?.success) {
    return <SuccessScreen registrationType={registrationType} />;
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2Location />;
      case 3:
        return registrationType === 'pharmacy' 
          ? <Step3PharmacyVerification /> 
          : <Step3HospitalVerification />;
      case 4:
        return <Step4ReviewAndSubmit />;
      default:
        return <Step1BasicInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white mb-4 shadow-lg">
            {registrationType === 'pharmacy' ? (
              <Pill size={32} />
            ) : (
              <Building2 size={32} />
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {registrationType === 'pharmacy' ? t('Registration.PharmacyRegistration') : t('Registration.HospitalRegistration')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t('Registration.RegisterFacility')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          {/* Progress line */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Step indicators */}
            <div className="relative flex justify-between">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  {/* Step circle */}
                  <motion.div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                      transition-all duration-300 z-10
                      ${currentStep > step.number 
                        ? 'bg-emerald-500 text-white' 
                        : currentStep === step.number 
                          ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-900' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }
                    `}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: currentStep === step.number ? 1.1 : 1 }}
                  >
                    {currentStep > step.number ? (
                      <Check size={20} />
                    ) : (
                      step.number
                    )}
                  </motion.div>
                  
                  {/* Step label */}
                  <div className="mt-2 text-center hidden sm:block">
                    <p className={`text-xs font-semibold ${
                      currentStep >= step.number 
                        ? 'text-gray-800 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile step indicator */}
          <div className="sm:hidden text-center mt-4">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Step {currentStep}: {steps[currentStep - 1].title}
            </p>
            <p className="text-xs text-gray-500">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy.
          <br />
          Your registration will be reviewed by our admin team.
        </p>
      </div>
    </div>
  );
};

export default RegistrationWizard;
