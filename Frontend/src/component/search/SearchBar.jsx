import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  facilityType,
  onFacilityTypeChange,
  placeholder,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="w-full"
    >
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex bg-slate-100 dark:bg-gray-700 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("hospital")}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition ${
              facilityType === "hospital"
                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                : "text-slate-500 dark:text-gray-200/80"
            }`}
          >
            Hospitals
          </button>
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("pharmacy")}
            className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold transition ${
              facilityType === "pharmacy"
                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                : "text-slate-500 dark:text-gray-200/80"
            }`}
          >
            Pharmacies
          </button>
          <button
            type="button"
            onClick={() => onFacilityTypeChange?.("all")}
            className={`hidden lg:inline-flex flex-1 py-3 px-6 rounded-lg text-sm font-bold transition ${
              facilityType === "all"
                ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-white"
                : "text-slate-500 dark:text-gray-200/80"
            }`}
          >
            All
          </button>
        </div>

        <div className="flex-1 flex items-center px-4 gap-3 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700">
          <FaSearch className="text-slate-400" />
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            type="text"
            placeholder={placeholder || "Search by name or location..."}
            className="bg-transparent w-full py-4 outline-none text-slate-700 dark:text-white"
            aria-label="Search"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-[0.99]"
        >
          Search
        </button>
      </div>
    </form>
  );
}

