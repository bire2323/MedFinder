import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper } from "../components/FormFields";
import WorkingHoursPicker from "../../WorkingHoursPicker";

const AvailabilitySection = ({ data, onChange, theme }) => {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="availability" title={t("Settings.Availability")} theme={theme}>
      <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-gray-800/50 rounded-3xl border border-gray-400 mb-6 transition-colors">
        <div className="flex items-center gap-4">
           <div className={`w-12 h-12 rounded-2xl ${theme?.badgeBg || 'bg-blue-100'} flex items-center justify-center ${theme?.textPrimary || 'text-blue-600'} shadow-sm`}>
              <Clock size={24} />
           </div>
           <div>
              <h4 className="text-base font-black uppercase tracking-tight">{t("Settings.FullTimeService")}</h4>
              <p className="text-xs text-slate-500 font-medium">{t("Settings.Operates247")}</p>
           </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform active:scale-95">
          <input 
            type="checkbox" 
            checked={data.is_full_time_service || false} 
            onChange={(e) => onChange("is_full_time_service", e.target.checked)}
            className="sr-only peer" 
          />
          <div className={`w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 ${theme?.name === 'emerald' ? 'peer-checked:bg-emerald-500' : 'peer-checked:bg-blue-500'} border border-gray-400 dark:border-gray-600 shadow-inner`}></div>
        </label>
      </div>
      
      {!data.is_full_time_service && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <WorkingHoursPicker 
            value={data.working_hour} 
            onChange={(v) => onChange("working_hour", v)} 
            theme={theme}
          />
        </div>
      )}
    </SectionWrapper>
  );
};

export default AvailabilitySection;
