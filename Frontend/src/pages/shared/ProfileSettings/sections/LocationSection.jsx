
import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapPin, Navigation, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionWrapper, InputField } from "../components/FormFields";
import { motion, AnimatePresence } from "framer-motion";


import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";

import { useRegistrationStore } from "../../../../store/registrationStore";
import { useActiveRegions, useCitiesByRegion } from "../../../../hooks/useLocationData";
import SelectInput from "../../../../components/common/SelectInput";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import WorkingHoursPicker from "../../WorkingHoursPicker";
import handleKeyDown from "../../../../hooks/handleKeyDown";


const LocationSection = ({ addressData = {}, onChange, error, theme }) => {
   const { t } = useTranslation();
   console.log("LocationSection render with addressData:", addressData);
   const [detecting, setDetecting] = useState(false);
   const { formData: storeFormData, errors: storeErrors } =
      useRegistrationStore();
   const {
      register,
      watch,
      setValue,
      formState,
   } = useForm();
   const cityId = watch("city_id");
   const fieldError = (name) =>
      formState.errors?.[name]?.message || storeErrors?.[name];
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

   const { regions, loading: regionsLoading, error: regionsError } = useActiveRegions();

   const regionOptions = useMemo(
      () => regions.map((r) => ({ value: String(r.id), label: r.name_en })),
      [regions]
   );
   const regionId = watch("region_id");
   const prevRegionIdRef = useRef(storeFormData.region_id ? String(storeFormData.region_id) : "");
   const { cities, loading: citiesLoading, error: citiesError } = useCitiesByRegion(regionId ? Number(regionId) : null);
   const cityOptions = useMemo(
      () => cities.map((c) => ({ value: String(c.id), label: c.name_en })),
      [cities]
   );
   useEffect(() => {
      if (prevRegionIdRef.current === null || prevRegionIdRef.current === "") {
         prevRegionIdRef.current = regionId;
         return;
      }
      if (prevRegionIdRef.current !== regionId) {
         setValue("city_id", "");
      }
      prevRegionIdRef.current = regionId;
   }, [regionId, setValue]);
   useEffect(() => {
      if (regionId) {
         onChange("region_id", Number(regionId));
      }
   }, [regionId]);

   useEffect(() => {
      if (cityId) {
         onChange("city_id", Number(cityId));
      }
   }, [cityId]);
   return (
      <SectionWrapper id="location" title={t("Settings.LocationAddress")} theme={theme}>
         {regionsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{regionsError}</div>
         ) : null}
         {citiesError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{citiesError}</div>
         ) : null}

         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectInput
               label="Region"
               name="region_id"
               register={register}
               required="Region is required"
               placeholder={regionsLoading ? "Loading regions..." : addressData?.region?.name_en || "Select a region"}
               value={addressData?.region_id ? String(addressData.region_id) : ""}
               options={regionOptions}
               disabled={regionsLoading}
               error={fieldError("region_id")}
            />

            <SelectInput
               label="City"
               name="city_id"
               register={register}
               required="City is required"
               placeholder={
                  !regionId ? addressData?.city?.name_en : citiesLoading ? "Loading cities..." : cityOptions.length ? "Select a city" : "No cities available"
               }
               value={addressData?.city_id ? String(addressData.city_id) : ""}
               options={cityOptions}
               disabled={!regionId || citiesLoading || cityOptions.length === 0}
               error={fieldError("city_id")}

            />
         </div>

         <div className="space-y-4 bg-slate-50/50 dark:bg-slate-950/30 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <MapPin size={16} className={theme?.textPrimary || 'text-blue-600'} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t("Settings.Coordinates")}</h4>
               </div>
               <button
                  onClick={handleLocationDetect}
                  disabled={detecting}
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 px-4 py-2 rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-sm ${theme?.textPrimary || 'text-emerald-500'}`}
               >
                  <Navigation size={12} className={detecting ? "animate-spin" : ""} />
                  {detecting ? "Detecting..." : t("Settings.UseCurrentLocation")}
               </button>
            </div>

            {/* Interactive Map view placeholder */}
            <div className="h-48 md:h-64 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 relative flex items-center justify-center group cursor-crosshair shadow-inner">
               <div className={`absolute inset-0 transition-colors pointer-events-none ${theme?.name === 'emerald' ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'bg-blue-500/5 group-hover:bg-blue-500/10'}`} />

               {addressData[0]?.latitude && addressData[0]?.longitude ? (
                  <div className="text-center z-10">
                     <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`${theme?.textPrimary || 'text-emerald-500'} drop-shadow-xl`}
                     >
                        <MapPin size={40} className="mx-auto animate-bounce" />
                     </motion.div>
                     <p className="text-xs font-black mt-2 font-mono text-slate-600 dark:text-gray-400">
                        {addressData[0]?.latitude}, {addressData[0].longitude}
                     </p>
                  </div>
               ) : (
                  <div className="text-center space-y-3 opacity-50 px-4 z-10">
                     <MapPin className="mx-auto text-slate-400" size={28} />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("Settings.InteractiveMapActive")}</p>
                     <p className="text-[10px] text-slate-400 font-bold">Tap to drop a pin or select "Use Current Location"</p>
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
