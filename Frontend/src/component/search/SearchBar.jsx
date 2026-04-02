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
        <div className="flex bg-slate-100 dark:bg-gray-700/50 rounded-2xl p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("hospital")}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${facilityType === "hospital"
                ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-white transform scale-[1.02]"
                : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
              }`}
          >
            🏥 {t("search.facilityTypes.hospital")}
          </button>
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("pharmacy")}
            className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 ${facilityType === "pharmacy"
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