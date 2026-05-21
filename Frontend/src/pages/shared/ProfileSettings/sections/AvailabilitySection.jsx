import React from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper } from "../components/FormFields";
import WorkingHoursPicker from "../../WorkingHoursPicker";

const AvailabilitySection = ({ data, onChange, theme }) => {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="availability" title={t("Settings.Availability")} theme={theme}>
      <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 mb-6 transition-colors shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${theme?.badgeBg || 'bg-emerald-50 dark:bg-emerald-950/40'} flex items-center justify-center ${theme?.textPrimary || 'text-emerald-600'} border border-emerald-500/10`}>
            <Clock size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-white">{t("Settings.FullTimeService")}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{t("Settings.Operates247")}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform active:scale-95">
          <input
            type="checkbox"
            checked={data.is_full_time_service || false}
            onChange={(e) => onChange("is_full_time_service", e.target.checked)}
            className="sr-only peer"
          />
          <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${data.is_full_time_service ? (theme?.name === 'emerald' ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-blue-500 shadow-md shadow-blue-500/20') : "bg-slate-300 dark:bg-slate-800 border border-slate-200/20"}`}></div>
          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${data.is_full_time_service ? "translate-x-6" : ""}`}></div>
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
