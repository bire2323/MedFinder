import React from "react";
import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { SectionWrapper, InputField, SelectField } from "../components/FormFields";

const GeneralInfoSection = ({ data, onChange, type, error, theme }) => {
  const { t } = useTranslation();
  return (
    <SectionWrapper id="general" title={t("Settings.GeneralInfo")} theme={theme}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label={t("Settings.FacilityNameEN")}
          value={data.hospital_name_en || data.pharmacy_name_en}
          onChange={(v) => onChange(type === "hospital" ? "hospital_name_en" : "pharmacy_name_en", v)}
          error={error?.name_en}
          theme={theme}
        />
        <InputField
          label={t("Settings.FacilityNameAM")}
          value={data.hospital_name_am || data.pharmacy_name_am}
          onChange={(v) => onChange(type === "hospital" ? "hospital_name_am" : "pharmacy_name_am", v)}
          placeholder="አይቤክስ አጠቃላይ ሆስፒታል / ፋርማሲ"
          error={error?.name_am}
          theme={theme}
        />
        <SelectField
          label={t("Settings.OwnershipType")}
          value={data.hospital_ownership_type || data.pharmacy_ownership_type}
          options={["Public", "Private", "NGO", "Other"]}
          onChange={(v) => onChange(type === "hospital" ? "hospital_ownership_type" : "pharmacy_ownership_type", v)}
          theme={theme}
        />
        <div className="flex items-end pb-1.5">
           <div className="w-full bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl flex items-center gap-3 border border-slate-200/60 dark:border-slate-800/80 shadow-sm shadow-slate-100/40 dark:shadow-none">
             <Building2 size={16} className="text-slate-400 dark:text-slate-550" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
               Facility Type: <span className={`${theme?.textPrimary || 'text-blue-600 dark:text-blue-400'} ml-1.5 font-black uppercase`}>{type}</span>
             </span>
           </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default GeneralInfoSection;
