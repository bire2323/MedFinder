import React from "react";
import { ShieldCheck, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InputField, FileInput } from "../components/FormFields";

const LicenseSection = ({ data, onChange, onFileChange, error, status, theme }) => {
  const { t } = useTranslation();
  const isApproved = status === "APPROVED";

  return (
    <section id="license" className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none scroll-mt-24">
      <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-3.5 border-b border-slate-100 dark:border-slate-800/40">
        <div className={`w-1.5 h-6 bg-gradient-to-b ${theme?.name === 'emerald' ? 'from-emerald-500 to-green-600' : 'from-blue-500 to-indigo-600'} rounded-full`} />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-white leading-none mr-2">{t("Settings.LicenseVerification")}</h3>
        {isApproved && (
           <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 text-[9px] font-black rounded-full flex items-center gap-1.5 border border-emerald-500/10 uppercase tracking-wider select-none animate-pulse">
             <ShieldCheck size={12} /> Verified
           </span>
        )}
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-950/30 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
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
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer text-slate-650 dark:text-slate-350 border border-slate-250/20 mt-4 md:mt-0"
            onClick={() => alert("Please contact admin@medfinder.com to update your license status.")}
          >
            {t("Settings.RequestUpdate")}
          </button>
        </div>
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800/60 pt-6">
           <FileInput
              label={t("Settings.UploadLicense")}
              icon={<FileText size={16} />}
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
