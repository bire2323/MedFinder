import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Save, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useProfileUpdate from "../../../hooks/useProfileUpdate";
import { getTheme } from "./utils/theme";

import SidebarNavigation from "./SidebarNavigation";
import GeneralInfoSection from "./sections/GeneralInfoSection";
import LicenseSection from "./sections/LicenseSection";
import ContactSection from "./sections/ContactSection";
import LocationSection from "./sections/LocationSection";
import AvailabilitySection from "./sections/AvailabilitySection";
import MediaSection from "./sections/MediaSection";
import DangerZoneSection, { ConfirmDeactivateModal } from "./sections/DangerZoneSection";

const ProfileSettingsLayout = ({ initialData, type = "hospital", onUpdateSuccess }) => {
  const { t } = useTranslation();
  const theme = getTheme(type);

  // Section Navigation
  const [activeSection, setActiveSection] = useState("general");
  console.log("initialData in layout", initialData);
  // Flat Data State
  const [formData, setFormData] = useState(initialData || {});

  // File State
  const [files, setFiles] = useState({});

  // Deactivation Modal State
  const [isDeactModalOpen, setDeactModalOpen] = useState(false);

  // Hook for API handling
  const { updateProfile, loading, error } = useProfileUpdate(type, initialData?.id);

  // Dirty State Calculation
  const isDirty = useMemo(() => {
    // Only highly dynamic fields that change often
    const flatFormObj = { ...formData, previewLogo: undefined };
    const flatInitialObj = { ...initialData, previewLogo: undefined };

    return JSON.stringify(flatFormObj) !== JSON.stringify(flatInitialObj) ||
      Object.keys(files).length > 0;
  }, [formData, files, initialData]);

  // Handle flat field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle nested object changes (address / working_hour)
  const handleNestedChange = (parentKey, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parentKey]: { ...prev[parentKey], [field]: value }
    }));
  };

  // Handle specific File additions
  const handleFileChange = (field, file) => {
    if (!file) return;
    setFiles(prev => ({ ...prev, [field]: file }));

    if (field === "logo") {
      setFormData(prev => ({ ...prev, previewLogo: URL.createObjectURL(file) }));
    }
  };

  // Submit Logic
  const handleSubmit = async () => {
    // Note: The preparePayload function logic is handled inside useProfileUpdate hook
    // It automatically stringifies `address` and `working_hour` and appends Files

    console.log("Submitting with formData:", formData, "and files:", files);

    const ok = await updateProfile(formData, files);
    if (ok) {
      if (onUpdateSuccess) onUpdateSuccess();
    } else {
      toast.error(t("Common.UpdateFailed", { defaultValue: "Failed to update profile." }));
    }
  };

  const renderActiveSection = () => {
    const props = { data: formData, onChange: handleChange, error, theme };

    switch (activeSection) {
      case "general":
        return <GeneralInfoSection {...props} type={type} />;
      case "license":
        return <LicenseSection {...props} onFileChange={handleFileChange} status={formData.status} />;
      case "contact":
        return <ContactSection {...props} />;
      case "location":
        return (
          <LocationSection
            addressData={formData.addresses}
            onChange={(field, value) => handleNestedChange("addresses", field, value)}
            error={error?.addresses}
            theme={theme}
          />
        );
      case "availability":
        return <AvailabilitySection {...props} />;
      case "media":
        return <MediaSection {...props} onFileChange={handleFileChange} />;
      case "danger":
        return <DangerZoneSection onDeactivateClick={() => setDeactModalOpen(true)} theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex   sticky top-0 lg:flex-row gap-8 w-full pb-32">
      <div className="lg:w-72 shrink-0">
        <SidebarNavigation
          activeSection={activeSection}
          onSectionClick={setActiveSection}
          theme={theme}
        />
      </div>

      <div className="flex-1 max-w-4xl relative overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full"
          >
            {renderActiveSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      <ConfirmDeactivateModal
        isOpen={isDeactModalOpen}
        onClose={() => setDeactModalOpen(false)}
        onConfirm={() => {
          setDeactModalOpen(false);
          // Handle Profile Disabling Logic via API
          toast.success("Profile deactivated successfully.");
        }}
      />

      {/* Floating Save Footer */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-full min-w-2xl px-4 pointer-events-auto"
          >
            <div className="bg-slate-900 dark:bg-gray-800 text-white p-4 sm:p-5 rounded-[1rem] border border-slate-700/50 dark:border-gray-700 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 w-full relative overflow-hidden backdrop-blur-2xl">
              {/* Glass Shimmer Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${type === 'pharmacy' ? 'from-emerald-500/10' : 'from-blue-500/10'} via-transparent ${type === 'pharmacy' ? 'to-green-500/10' : 'to-purple-500/10'} pointer-events-none`} />

              <div className="flex items-center gap-4 z-10 w-full justify-center sm:justify-start">
                <div className={`w-12 h-12 bg-white/10 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center ${theme.textPrimary} shrink-0 border border-white/5`}>
                  <AlertTriangle size={20} className="animate-pulse" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm sm:text-base font-black tracking-tight">{t("Settings.UnsavedChanges")}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
                    You have modified your profile settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto z-10">
                <button
                  onClick={() => {
                    setFormData(initialData);
                    setFiles({});
                  }}
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t("Common.Discard")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex-1 sm:flex-none ${theme.bgPrimary} text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2 ${theme.bgHover} hover:scale-105 shadow-xl ${theme.shadow} disabled:opacity-50 disabled:hover:scale-100 transition-all`}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {t("Common.SaveUpdated")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSettingsLayout;
