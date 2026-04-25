import React from "react";
import { useTranslation } from "react-i18next";

export default function FilterPanel({
  filters,
  onChange,
  availableDepartments = [],
  showDepartments = true,
}) {
  const { t } = useTranslation();

  const distanceOptions = [
    { id: "any", label: t("filters.distance.any") },
    { id: "lt1", label: t("filters.distance.lt1") },
    { id: "1to5", label: t("filters.distance.1to5") },
    { id: "5to10", label: t("filters.distance.5to10") },
    { id: "gt10", label: t("filters.distance.gt10") },
  ];

  const facilityTypeOptions = [
    { id: "all", label: t("filters.type.all") },
    { id: "hospital", label: t("filters.type.hospital") },
    { id: "pharmacy", label: t("filters.type.pharmacy") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t("filters.distance.title")}
        </h3>
        <div className="mt-3 space-y-2">
          {distanceOptions.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-200">
              <input
                type="radio"
                name="distance"
                value={opt.id}
                checked={filters.distance === opt.id}
                onChange={(e) => onChange({ ...filters, distance: e.target.value })}
                className="h-4 w-4 accent-blue-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t("filters.type.title")}
        </h3>
        <div className="mt-3 space-y-2">
          {facilityTypeOptions.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 text-sm text-slate-700 dark:text-gray-200">
              <input
                type="radio"
                name="type"
                value={opt.id}
                checked={filters.type === opt.id}
                onChange={(e) => onChange({ ...filters, type: e.target.value })}
                className="h-4 w-4 accent-blue-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t("filters.availability.title")}
        </h3>
        <label className="mt-3 flex items-center gap-3 text-sm text-slate-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          {t("filters.availability.openNow")}
        </label>
        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          {t("filters.availability.hint")}
        </p>
      </div>

      {showDepartments && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t("filters.departments.title")}
          </h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
            {t("filters.departments.hint")}
          </p>
          <div className="mt-3">
            <select
              value={filters.department}
              onChange={(e) => onChange({ ...filters, department: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">{t("filters.departments.any")}</option>
              {availableDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          onChange({
            distance: "any",
            type: "all",
            openNow: false,
            department: "any",
          })
        }
        className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
      >
        {t("filters.reset")}
      </button>
    </div>
  );
}