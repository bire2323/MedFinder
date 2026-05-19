import React from "react";
import { Image as ImageIcon, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper } from "../components/FormFields";

const MediaSection = ({ data, onFileChange, theme }) => {
   const { t } = useTranslation();
   return (
      <SectionWrapper id="media" title={t("Settings.MediaIdentity")} theme={theme}>
         <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50/50 dark:bg-slate-950/30 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative group shrink-0">
               <div className={`w-40 h-40 rounded-[2rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden border border-dashed border-slate-200 dark:border-slate-850 group-hover:${theme?.borderPrimary || 'border-emerald-500'} shadow-sm transition-all duration-300`}>
                  {data.logo_url ? (
                     <img src={data.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                     <div className="flex flex-col items-center text-slate-400 dark:text-slate-650 gap-2">
                        <ImageIcon size={32} />
                        <span className="text-[10px] uppercase font-black tracking-widest">No Logo</span>
                     </div>
                  )}
               </div>
               <label className={`absolute -bottom-2 -right-2 w-10 h-10 ${theme?.bgPrimary || 'bg-emerald-600'} text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-110 hover:-rotate-12 transition-transform active:scale-95 z-10`}>
                  <Save size={16} />
                  <input
                     type="file"
                     className="sr-only"
                     onChange={(e) => onFileChange("logo", e.target.files[0])}
                     accept="image/png, image/jpeg, image/webp"
                  />
               </label>
            </div>
            <div className="flex-1 space-y-3">
               <h4 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white">{t("Settings.FacilityLogo")}</h4>
               <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold leading-relaxed max-w-sm">
                  {t("Settings.LogoDescription")}
               </p>
               <div className="flex flex-wrap gap-2 pt-2">
                  <Badge text="PNG, JPG, WEBP" />
                  <Badge text="1:1 Aspect Ratio" />
                  <Badge text="Max Size: 2MB" />
                  <Badge text="Transparent BG Preferred" color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-500/10" />
               </div>
            </div>
         </div>
      </SectionWrapper>
   );
};

const Badge = ({ text, color = "bg-white dark:bg-slate-900 text-slate-550 dark:text-slate-450 border border-slate-200/60 dark:border-slate-800" }) => (
   <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm select-none ${color}`}>
      {text}
   </span>
);

export default MediaSection;
