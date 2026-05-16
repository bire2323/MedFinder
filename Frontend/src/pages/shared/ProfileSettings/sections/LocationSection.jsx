import React, { useState } from "react";
import { MapPin, Navigation, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper, InputField } from "../components/FormFields";
import { motion, AnimatePresence } from "framer-motion";

const LocationSection = ({ addressData = {}, onChange, error, theme }) => {
   const { t } = useTranslation();
   const [detecting, setDetecting] = useState(false);

   const handleLocationDetect = () => {
      setDetecting(true);
      if (!navigator.geolocation) {
         alert("Geolocation is not supported by your browser.");
         setDetecting(false);
         return;
      }
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            onChange("latitude", pos.coords.latitude);
            onChange("longitude", pos.coords.longitude);

            setDetecting(false);
         },
         (err) => {
            console.warn("Geolocation Error:", err.message);
            alert("Unable to retrieve your location.");
            setDetecting(false);
         }
      );
   };
   console.log(addressData);
   return (
      <SectionWrapper id="location" title={t("Settings.LocationAddress")} theme={theme}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InputField
               label={t("Settings.RegionEN")}
               value={addressData[0]?.region_en}
               onChange={(v) => onChange("region_en", v)}
               placeholder="e.g. Addis Ababa"
               theme={theme}
            />
            <InputField
               label={t("Settings.RegionAM")}
               value={addressData[0]?.region_am}
               onChange={(v) => onChange("region_am", v)}
               placeholder="አዲስ አበባ"
               theme={theme}
            />
            <InputField
               label={t("Settings.ZoneSubCity")}
               value={addressData[0]?.zone_en || addressData[0]?.sub_city_en}
               onChange={(v) => onChange("zone_en", v)}
               placeholder="Bole Subcity"
               theme={theme}
            />
            <InputField
               label={t("Settings.Kebele")}
               value={addressData[0]?.kebele}
               onChange={(v) => onChange("kebele", v)}
               placeholder="03"
               theme={theme}
            />
         </div>

         <div className="space-y-4 bg-slate-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-400">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <MapPin size={18} className={theme?.textPrimary || 'text-blue-600'} />
                  <h4 className="text-sm font-black uppercase tracking-widest">{t("Settings.Coordinates")}</h4>
               </div>
               <button
                  onClick={handleLocationDetect}
                  disabled={detecting}
                  className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${theme?.textPrimary || 'text-blue-600 dark:text-blue-400'} ${theme?.badgeBg || 'bg-blue-100 dark:bg-blue-900/30'} px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50`}
               >
                  <Navigation size={14} className={detecting ? "animate-spin" : ""} />
                  {detecting ? "Detecting..." : t("Settings.UseCurrentLocation")}
               </button>
            </div>

            {/* Placeholder for Interactive Map */}
            <div className="h-48 md:h-64 bg-slate-200 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-600 relative flex items-center justify-center group cursor-crosshair">
               <div className={`absolute inset-0 transition-colors pointer-events-none ${theme?.name === 'emerald' ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'bg-blue-500/5 group-hover:bg-blue-500/10'}`} />

               {addressData[0]?.latitude && addressData[0]?.longitude ? (
                  <div className="text-center">
                     <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`${theme?.textPrimary} drop-shadow-xl`}
                     >
                        <MapPin size={48} className="mx-auto" />
                     </motion.div>
                     <p className="text-xs font-bold mt-2 font-mono text-slate-600 dark:text-gray-400">
                        {addressData[0]?.latitude}, {addressData[0].longitude}
                     </p>
                  </div>
               ) : (
                  <div className="text-center space-y-3 opacity-50 px-4">
                     <MapPin className="mx-auto text-slate-500" size={32} />
                     <p className="text-xs font-bold uppercase tracking-widest">{t("Settings.InteractiveMapActive")}</p>
                     <p className="text-[10px] text-slate-500">Tap to drop a pin or select "Use Current Location"</p>
                  </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <InputField
                  label={t("Settings.Latitude")}
                  value={addressData[0]?.latitude}
                  onChange={(v) => onChange("latitude", v)}
                  error={error?.latitude}
                  placeholder="9.0123"
                  theme={theme}
               />
               <InputField
                  label={t("Settings.Longitude")}
                  value={addressData[0]?.longitude}
                  onChange={(v) => onChange("longitude", v)}
                  error={error?.longitude}
                  placeholder="38.7451"
                  theme={theme}
               />
            </div>
         </div>
      </SectionWrapper>
   );
};

export default LocationSection;
