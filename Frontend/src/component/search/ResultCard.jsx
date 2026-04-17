import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaStar,
  FaHospital,
  FaPills,
  FaClinicMedical,
  FaMapMarkedAlt,
  FaDirections
} from "react-icons/fa";

/**
 * Utility to format distance from meters to km/m
 */
function formatDistance(meters) {
  if (!Number.isFinite(meters)) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Small component for showing Open/Closed/24/7 status
 */
function AvailabilityPill({ isOpen, isFullTime, workingHours }) {
  const label = isFullTime ? "24/7" : isOpen === true ? "Open" : workingHours ? workingHours : "Hours unknown";
  const tone = isFullTime
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
    : isOpen === true
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
      : isOpen === false
        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
        : "bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-200";

  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tone}`}>{label}</span>;
}

export default function ResultCard({ facility, onClick, viewMode = "grid" }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAmharic = i18n.language === 'am';

  const isHospital = facility.type === "hospital";
  const isPharmacy = facility.type === "pharmacy";

  const localizedName = isHospital
    ? (isAmharic ? facility.hospital_name_am : facility.hospital_name_en)
    : (isAmharic ? facility.pharmacy_name_am : facility.pharmacy_name_en);
  const name = localizedName || facility.name || "Unnamed Facility";

  // 2. CONSTRUCT ADDRESS
  const getAddress = () => {
    if (isAmharic && facility.address_description_am) return facility.address_description_am;
    if (!isAmharic && facility.address_description_en) return facility.address_description_en;

    if (facility.addresses && facility.addresses.length > 0) {
      const addr = facility.addresses[0];
      if (isAmharic) {
        return `${addr.sub_city_am || ""}, ${addr.zone_am || ""}, ${addr.region_am || ""}`.replace(/^, |, $/g, "").replace(/, , /g, ", ");
      }
      return `${addr.sub_city_en || ""}, ${addr.zone_en || ""}, ${addr.region_en || ""}`.replace(/^, |, $/g, "").replace(/, , /g, ", ");
    }
    return facility.address || t("search.addressNotAvailable");
  };

  // 3. WORKING HOURS
  const workingHours = facility.working_hour || (facility.is_full_time_service ? "24/7" : null);

  const typeLabel = isHospital ? t("search.hospital") : isPharmacy ? t("search.pharmacy") : t("search.facility");
  const typeTone = isHospital
    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
    : isPharmacy
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-slate-500/10 text-slate-400 border-slate-500/20";

  const tags = isHospital
    ? (facility.departments?.length ? facility.departments : facility.services)?.slice?.(0, 2) || []
    : [];

  const openInInternalMap = (e) => {
    e.stopPropagation();
    navigate("/home/map", { state: { selectedFacility: facility } });
  };

  const isList = viewMode === "list";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] hover:-translate-y-1.5 transition-all duration-300 w-full flex ${isList ? 'flex-col sm:flex-row h-auto text-left items-stretch' : 'flex-col h-full'}`}
   >
      {/* 1. TOP SECTION: ICON/LOGO PREVIEW */}
      <div className={`relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center border-slate-100 dark:border-gray-800 shrink-0 ${isList ? 'w-full sm:w-48 lg:w-1/3 sm:border-r border-b sm:border-b-0 h-48 sm:h-auto' : 'h-40 w-full border-b'}`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl"></div>
        </div>

        <div className={`relative z-10 rounded-2xl border-2 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ${isList ? 'w-24 h-24' : 'w-24 h-24'}`}>
          {facility.raw ? (
            <img src={facility.raw?.logo_url} alt={name} className="w-full h-full object-cover dark:opacity-50" />
          ) : (
            <div className={`text-4xl ${isHospital ? 'text-blue-500' : 'text-emerald-500'}`}>
              {isHospital ? <FaHospital /> : isPharmacy ? <FaPills /> : <FaClinicMedical />}
            </div>
          )}
        </div>

        <div
          onClick={openInInternalMap}
          className={` ${isList ? 'hidden' : 'absolute'} top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-gray-300 hover:text-blue-500 shadow-sm border border-white/20 dark:border-gray-700 transition-colors z-20`}
          title={t("search.viewOnMap")}
        >
          <FaMapMarkedAlt size={18} />
        </div>
      </div>

      {/* 2 & 3. CONTENT AND FOOTER COMBINED SECTION */}
      <div className={`relative flex flex-col flex-1 p-0 ${isList ? '' : ''}`}>
        <div className="flex-1 p-5 flex flex-col items-start text-left w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${typeTone}`}>
              {typeLabel}
            </span>
            <AvailabilityPill
              isOpen={facility.isOpen}
              isFullTime={facility.raw?.is_full_time_service === 1 || facility.raw?.working_hour === "24/7" || facility.raw?.isFullTime}
              whour={facility.raw?.working_hour}
            />
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors line-clamp-2 text-left">
            {name}
          </h3>
           <div
          onClick={openInInternalMap}
          className={` ${isList ? 'absolute' : 'hidden'} top-3 right-3 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-gray-300 hover:text-blue-500 shadow-sm border border-white/20 dark:border-gray-700 transition-colors z-20`}
          title={t("search.viewOnMap")}
        >
          <FaMapMarkedAlt size={18} />
        </div>

          <div className="mt-2 space-y-1 w-full text-left">
            <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1 italic">
              {getAddress()}
            </p>

            {/* Drug Info Overlay */}
            {facility.drugPrice && (
              <div className={`mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 flex justify-between items-center w-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors ${isList ? 'sm:max-w-md' : ''}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t("search.price")}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {facility.drugPrice} <span className="text-xs font-bold text-slate-400 uppercase">{t("Common.Currency")}</span>
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t("search.availability")}</span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${facility.drugAvailability === 'available' || facility.drugAvailability === true
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                    }`}>
                    <div className={`w-1 h-1 rounded-full ${facility.drugAvailability === 'available' || facility.drugAvailability === true ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                    {facility.drugAvailability === 'available' || facility.drugAvailability === true
                      ? t("search.available")
                      : t("search.not_available")}
                  </div>
                </div>
              </div>
            )}

            {workingHours && !facility.drugPrice && (
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {workingHours}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="mt-auto pt-4 flex flex-wrap gap-1.5 w-full">
            {tags.map((tItem, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              >
                {typeof tItem === "string" ? tItem : tItem?.name || tItem?.department_name_en || tItem?.service_name_en || "Medical"}
              </span>
            ))}
            {facility.rating > 0 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 flex items-center gap-1 ml-auto">
                <FaStar size={10} /> {facility.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* 3. FOOTER */}
        <div className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-gray-800 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              {t("search.viewDetails")}
            </span>
            {facility.drugPrice && (
              <button
                onClick={openInInternalMap}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 hover:bg-blue-700 hover:scale-105 transition-all shadow-md active:scale-95"
              >
                <FaDirections size={12} />
                {t("FacilityDetail.Directions")}
              </button>
            )}
          </div>

          {Number.isFinite(facility.distanceMeters) && (
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">{t("search.distance_label")}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {formatDistance(facility.distanceMeters)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
