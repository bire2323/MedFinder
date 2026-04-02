import React from "react";
import { ShieldCheck, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InputField, FileInput } from "../components/FormFields";

const LicenseSection = ({ data, onChange, onFileChange, error, status, theme }) => {
  const { t } = useTranslation();
  const isApproved = status === "APPROVED";

  return (
    <section id="license" className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-400 dark:border-gray-500 shadow-sm scroll-mt-24">
      <div className="flex items-center gap-4 mb-8">
        <div className={`w-2 h-8 ${theme?.bgPrimary || 'bg-blue-600'} rounded-full`} />
        <h3 className="text-2xl font-black uppercase tracking-tight">{t("Settings.LicenseVerification")}</h3>
        {isApproved && (
           <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
             <ShieldCheck size={14} /> Verified
           </span>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-400">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-1/2">
            <InputField
              label={t("Settings.LicenseNumber")}
              value={data.license_number}
              onChange={(v) => onChange("license_number", v)}
              readOnly={isApproved}
              tooltip={isApproved ? "Contact admin to update an approved license." : null}
              error={error?.license_number}
              theme={theme}
            />
          </div>
          <button 
            type="button"
            className={`${theme?.textPrimary || 'text-blue-600 dark:text-blue-400'} text-xs font-bold hover:underline ${theme?.bgLight || 'bg-blue-50 dark:bg-blue-900/20'} px-4 py-2 rounded-xl mt-4 md:mt-0`}
            onClick={() => alert("Please contact admin@medfinder.com to update your license status.")}
          >
            {t("Settings.RequestUpdate")}
          </button>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
           <FileInput
              label={t("Settings.UploadLicense")}
              icon={<FileText size={18} />}
              onChange={(f) => onFileChange("official_license_upload", f)}
              currentFile={data.official_license_upload}
              theme={theme}
           />
        </div>
      </div>
    </section>
  );
};

export default LicenseSection;
