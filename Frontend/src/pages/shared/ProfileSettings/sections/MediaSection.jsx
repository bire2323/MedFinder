import React from "react";
import { Image as ImageIcon, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper } from "../components/FormFields";

const MediaSection = ({ data, onFileChange, theme }) => {
  const { t } = useTranslation();

  return (
    <SectionWrapper id="media" title={t("Settings.MediaIdentity")} theme={theme}>
       <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-400">
          <div className="relative group shrink-0">
             <div className={`w-40 h-40 rounded-[2.5rem] bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-400 group-hover:${theme?.borderPrimary || 'border-blue-400'} shadow-sm transition-all`}>
                {data.previewLogo ? (
                   <img src={data.previewLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                   <div className="flex flex-col items-center text-slate-400 gap-2">
                     <ImageIcon size={40} className="text-slate-300" />
                     <span className="text-[10px] uppercase font-black tracking-widest">No Logo</span>
                   </div>
                )}
             </div>
             <label className={`absolute -bottom-2 -right-2 w-12 h-12 ${theme?.bgPrimary || 'bg-blue-600'} text-white rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 hover:-rotate-12 transition-transform active:scale-95`}>
                <Save size={20} />
                <input 
                  type="file" 
                  className="sr-only" 
                  onChange={(e) => onFileChange("logo", e.target.files[0])} 
                  accept="image/png, image/jpeg, image/webp" 
                />
             </label>
          </div>
          <div className="flex-1 space-y-3">
             <h4 className="font-black text-lg uppercase tracking-tight">{t("Settings.FacilityLogo")}</h4>
             <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                {t("Settings.LogoDescription")}
             </p>
             <div className="flex flex-wrap gap-2 pt-2">
                <Badge text="PNG, JPG, WEBP" />
                <Badge text="1:1 Aspect Ratio" />
                <Badge text="Max Size: 2MB" />
                <Badge text="Transparent BG Preferred" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" />
             </div>
          </div>
       </div>
    </SectionWrapper>
  );
};

const Badge = ({ text, color = "bg-white dark:bg-gray-700 text-slate-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600" }) => (
  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${color}`}>
    {text}
  </span>
);

export default MediaSection;
