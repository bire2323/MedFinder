import React from "react";
import { useTranslation } from "react-i18next";

export default function DepartmentServiceFilterSidebar({
  departments,
  services,
  selectedDeptIds,
  selectedServiceIds,
  onToggleDepartment,
  onToggleService,
  distance,
  onDistanceChange,
  onReset,
  labelDept,
  labelSvc,
}) {
  const { t } = useTranslation();

  const distanceOptions = [
    { id: "any", label: t("filters.distance.any") },
    { id: "lt1", label: t("filters.distance.lt1") },
    { id: "1to5", label: t("filters.distance.1to5") },
    { id: "5to10", label: t("filters.distance.5to10") },
    { id: "gt10", label: t("filters.distance.gt10") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("filters.distance.title")}</h3>
        <div className="mt-3 space-y-2">
          {distanceOptions.map((opt) => (
            <label key={opt.id} className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-gray-200">
              <input
                type="radio"
                name="ds-distance"
                value={opt.id}
                checked={distance === opt.id}
                onChange={() => onDistanceChange(opt.id)}
                className="h-4 w-4 accent-emerald-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{labelDept}</h3>
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
          {departments.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={selectedDeptIds.includes(d.id)}
                onChange={() => onToggleDepartment(d.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>{d.label}</span>
            </label>
          ))}
          {departments.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-gray-500">{t("departmentServiceSearch.sidebarEmptyDept")}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{labelSvc}</h3>
        <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
          {services.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={selectedServiceIds.includes(s.id)}
                onChange={() => onToggleService(s.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
              />
              <span>{s.label}</span>
            </label>
          ))}
          {services.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-gray-500">{t("departmentServiceSearch.sidebarEmptySvc")}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
      >
        {t("departmentServiceSearch.resetFilters")}
      </button>
    </div>
  );
}
