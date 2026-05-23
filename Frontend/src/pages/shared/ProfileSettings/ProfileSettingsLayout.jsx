import React, { useState, useMemo, useEffect } from "react";
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

import { useOutletContext } from "react-router-dom";

const ProfileSettingsLayout = ({ type = "hospital" }) => {
  const { t } = useTranslation();
  const theme = getTheme(type);

  const { pharmacyProfile } = useOutletContext();
  const { hospitalProfile } = useOutletContext();
  const isPharmacy = type === "pharmacy";
  const initialData = isPharmacy ? pharmacyProfile : hospitalProfile;
  // console.log(initialData);

  // Section Navigation
  const [activeSection, setActiveSection] = useState("general");
  // console.log("initialData in layout", pharmacyProfile);
  // Flat Data State
  const [formData, setFormData] = useState(initialData || {});
  const [baselineData, setBaselineData] = useState(initialData || {});
  const [successMessage, setSuccessMessage] = useState("");

  // File State
  const [files, setFiles] = useState({});

  // Deactivation Modal State
  const [isDeactModalOpen, setDeactModalOpen] = useState(false);

  // Hook for API handling
  const { updateProfile, loading, error, success } = useProfileUpdate(type, initialData?.id);

  useEffect(() => {
    setFormData(initialData || {});
    setBaselineData(initialData || {});
    setSuccessMessage("");
  }, [initialData]);

  // Dirty State Calculation
  const isDirty = useMemo(() => {
    // Only highly dynamic fields that change often
    const flatFormObj = { ...formData, previewLogo: undefined };
    const flatBaselineObj = { ...baselineData, previewLogo: undefined };

    return JSON.stringify(flatFormObj) !== JSON.stringify(flatBaselineObj) ||
      Object.keys(files).length > 0;
  }, [formData, files, baselineData]);

  // Handle flat field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle nested object changes (address / working_hour)
  const handleNestedChange = (parentKey, field, value) => {
    setFormData(prev => {
      const parentValue = prev[parentKey];
      if (Array.isArray(parentValue)) {
        const nextArray = [...parentValue];
        nextArray[0] = { ...nextArray[0], [field]: value };
        return { ...prev, [parentKey]: nextArray };
      }

      return {
        ...prev,
        [parentKey]: { ...parentValue, [field]: value }
      };
    });
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

    const result = await updateProfile(formData, files);
    if (result.ok) {
      setBaselineData(formData);
      setFiles({});
      setSuccessMessage(result.message || t("Common.UpdatedSuccessfully", { defaultValue: "Profile updated successfully." }));
      toast.success(result.message || t("Common.UpdatedSuccessfully", { defaultValue: "Profile updated successfully." }));
      setTimeout(() => setSuccessMessage(""), 6000);
    } else {
      setSuccessMessage("");
      toast.error(result.message || t("Common.UpdateFailed", { defaultValue: "Failed to update profile." }));
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
    <div className="flex flex-col lg:flex-row gap-8 w-full pb-32">
      <div className="lg:w-72 shrink-0 lg:sticky lg:top-4 h-fit">
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
        <div className={`${!error ? "hidden" : "block"} bg-rose-50/90 dark:bg-rose-950/95 border border-rose-200 dark:border-rose-900/50 p-4 mt-5 rounded-3xl shadow-xl shadow-rose-500/10`}>
          {error && (
            <div className="space-y-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
              {typeof error === "string" ? (
                <p>{error}</p>
              ) : (
                <>
                  {error.pharmacy_name_en && <p>{error.pharmacy_name_en}</p>}
                  {error.pharmacy_name_am && <p>{error.pharmacy_name_am}</p>}
                  {error.hospital_name_en && <p>{error.hospital_name_en}</p>}
                  {error.hospital_name_am && <p>{error.hospital_name_am}</p>}
                  {error.contact_phone && <p>{error.contact_phone}</p>}
                  {error.contact_email && <p>{error.contact_email}</p>}
                  {error.latitude && <p>{error.latitude}</p>}
                  {error.longitude && <p>{error.longitude}</p>}
                  {error.ownership_type && <p>{error.ownership_type}</p>}
                </>
              )}
            </div>
          )}
        </div>
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

      {successMessage && (
        <div className="fixed left-1/2 top-24 z-50 w-full max-w-3xl -translate-x-1/2 px-4 pointer-events-none">
          <div className="pointer-events-auto rounded-3xl border border-emerald-200 bg-emerald-50/95 p-4 shadow-2xl shadow-emerald-500/10 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/95 dark:text-emerald-100">
            <p className="text-sm font-bold">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Floating Save Footer */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/40 backdrop-blur-xl py-4 px-5 text-white pointer-events-auto">
              <div className={`absolute inset-0 bg-gradient-to-r ${type === 'pharmacy' ? 'from-emerald-500/20 via-transparent to-green-500/5' : 'from-blue-500/20 via-transparent to-purple-500/10'} pointer-events-none`} />
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white/80 to-transparent opacity-20 pointer-events-none" />
              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/10">
                    <AlertTriangle size={20} className="text-amber-200 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-base font-black tracking-tight text-white">{t("Settings.UnsavedChanges")}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-300">{t("Settings.YouHavePendingChanges", { defaultValue: "Save your changes before leaving." })}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    onClick={() => {
                      setFormData(initialData);
                      setFiles({});
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-100 transition hover:bg-white/10"
                  >
                    {t("Common.Discard")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition ${theme.bgPrimary} ${theme.bgHover} shadow-xl ${theme.shadow} disabled:opacity-50 disabled:pointer-events-none`}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{t("Common.SaveUpdated")}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSettingsLayout;
