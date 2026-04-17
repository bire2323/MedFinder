import React from "react";
import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AutocompleteInput from "./AutocompleteInput";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  facilityType,
  onFacilityTypeChange,
  placeholder,
}) {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="w-full"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <div className="hidden lg:flex bg-slate-100 dark:bg-gray-700/50 rounded-2xl  md:p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("hospital")}
            className={`flex-1 py-0.5 md:py-3 px-1 md:px-6 rounded-xl text-sm font-bold transition-all duration-300 ${facilityType === "hospital"
                ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-white transform scale-[1.02]"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
              }`}
          >
            🏥 {t("search.facilityTypes.hospital")}
          </button>
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("pharmacy")}
            className={`flex-1 py-2 md:py-3 px-2 lg:px-4 rounded-xl text-sm font-bold transition-all duration-300 ${facilityType === "pharmacy"
                ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-white transform scale-[1.02]"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
              }`}
          >
            💊 {t("search.facilityTypes.pharmacy")}
          </button>
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("drug")}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${facilityType === "drug"
                ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-white transform scale-[1.02]"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
              }`}
          >
            🧪 {t("search.facilityTypes.drug")}
          </button>
        </div>
     <select
  value={facilityType}
  onChange={(e) => onFacilityTypeChange?.(e.target.value)}
  className="
    lg:hidden
    w-fit
    appearance-none
    bg-slate-100 dark:bg-gray-700/50
    border border-slate-200 dark:border-gray-600
    rounded-2xl
    pr-10 pl-4 py-3
    text-slate-800 dark:text-white
    text-sm font-medium
    shadow-inner
    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent
    transition-all duration-200
    cursor-pointer
  "
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundPosition: 'right 1px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5rem'
  }}
>
  <option value="all"    ><span className="px-10" >🏥 {t("search.facilityTypes.all")}</span></option>
  <option value="hospital"> 🏥 {t("search.facilityTypes.hospital")}</option>
  <option value="pharmacy">💊 {t("search.facilityTypes.pharmacy")}</option>
  <option value="drug">🧪 {t("search.facilityTypes.drug")}</option>
</select>
      

        <div className="flex-1 relative group">
          {facilityType === 'drug' ? (
            <AutocompleteInput 
              onSearch={(val) => {
                onChange?.(val);
                onSubmit?.();
              }}
              placeholder={t("search.drug_placeholder")}
            />
          ) : (
            <div className="flex items-center px-5 gap-3 bg-white dark:bg-gray-800 rounded-2xl border-none shadow-xl h-full group-focus-within:ring-2 group-focus-within:ring-blue-500 transition-all">
              <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                type="text"
                placeholder={placeholder || t("search.placeholder")}
                className="bg-transparent w-full py-4 outline-none text-slate-700 dark:text-white placeholder:text-slate-400"
                aria-label={t("search.inputLabel")}
                onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-green-800 hover:bg-green-700 dark:bg-slate-500 dark:hover:bg-slate-400 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {t("search.searchButton")}
        </button>
      </div>
    </form>
  );
}