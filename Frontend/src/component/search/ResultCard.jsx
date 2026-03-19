import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaStar, 
  FaHospital, 
  FaPills, 
  FaClinicMedical, 
  FaMapMarkedAlt 
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
function AvailabilityPill({ isOpen, isFullTime }) {
  const label = isFullTime ? "24/7" : isOpen === true ? "Open" : isOpen === false ? "Closed" : "Hours unknown";
  const tone = isFullTime
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
    : isOpen === true
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
      : isOpen === false
        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200"
        : "bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-200";

  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tone}`}>{label}</span>;
}

export default function ResultCard({ facility, onClick }) {
  const navigate = useNavigate();

  const isHospital = facility.type === "hospital";
  const isPharmacy = facility.type === "pharmacy";
  const typeLabel = isHospital ? "Hospital" : isPharmacy ? "Pharmacy" : "Facility";
  const typeTone = isHospital
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
    : isPharmacy
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
      : "bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-200";

  // Extracts departments for hospitals or returns empty for pharmacies
  const tags = isHospital
    ? (facility.departments?.length ? facility.departments : facility.services)?.slice?.(0, 3) || []
    : [];

  /**
   * Navigates to the map page and highlights this specific facility
   */
  const openInInternalMap = (e) => {
    e.stopPropagation(); // Prevents clicking the map from triggering the card's onClick
    navigate("/map", { state: { selectedFacility: facility } });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full group rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-lg hover:border-slate-300 dark:hover:border-gray-600 transition"
    >
      <div className="flex items-start gap-5">
        {/* --- 1. LEFT SIDE: CIRCULAR LOGO --- */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-full border-2 border-slate-100 dark:border-gray-700 overflow-hidden bg-slate-50 dark:bg-gray-900 flex items-center justify-center shadow-sm">
            {facility.logoUrl ? (
              <img 
                src={facility.logoUrl} 
                alt={facility.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`text-3xl ${isHospital ? 'text-blue-600' : 'text-emerald-600'}`}>
                {isHospital ? <FaHospital /> : isPharmacy ? <FaPills /> : <FaClinicMedical />}
              </div>
            )}
          </div>
        </div>

        {/* --- 2. RIGHT SIDE: CONTENT --- */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${typeTone}`}>{typeLabel}</span>
              <AvailabilityPill isOpen={facility.isOpen} isFullTime={facility.isFullTime} />
              {Number.isFinite(facility.rating) && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 inline-flex items-center gap-1">
                  <FaStar className="text-yellow-500" /> {facility.rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Map Navigation Icon */}
            <div className="flex gap-2">
              <div 
                onClick={openInInternalMap}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                title="View on Map"
              >
                <FaMapMarkedAlt className="text-xl" />
              </div>
            </div>
          </div>

          <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
            {facility.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400 line-clamp-1 italic">
            {facility.address || "Address not available"}
          </p>

          {/* Tags Section */}
          {tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((t, idx) => (
                <span
                  key={`${facility.id}-${idx}`}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-gray-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600"
                >
                  {typeof t === "string" ? t : t?.name || t?.department_name_en || t?.service_name_en || "Service"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-gray-700/50 flex justify-between items-center">
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-block">
          View full details →
        </span>

        {Number.isFinite(facility.distanceMeters) && (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mr-2">Distance</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {formatDistance(facility.distanceMeters)}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}