import React from "react";

const DISTANCE_OPTIONS = [
  { id: "any", label: "Any distance" },
  { id: "lt1", label: "< 1 km" },
  { id: "1to5", label: "1–5 km" },
  { id: "5to10", label: "5–10 km" },
  { id: "gt10", label: "> 10 km" },
];

export default function FilterPanel({
  filters,
  onChange,
  availableDepartments = [],
  showDepartments = true,
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Distance</h3>
        <div className="mt-3 space-y-2">
          {DISTANCE_OPTIONS.map((opt) => (
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
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Facility type</h3>
        <div className="mt-3 space-y-2">
          {[
            { id: "all", label: "All" },
            { id: "hospital", label: "Hospital" },
            { id: "pharmacy", label: "Pharmacy" },
          ].map((opt) => (
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
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Availability</h3>
        <label className="mt-3 flex items-center gap-3 text-sm text-slate-700 dark:text-gray-200">
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
            className="h-4 w-4 accent-blue-600"
          />
          Open now
        </label>
        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          Uses 24/7 flag when available; otherwise hours may be unknown.
        </p>
      </div>

      {showDepartments && (
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Departments / Services</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
            Filter applies to hospitals only.
          </p>
          <div className="mt-3">
            <select
              value={filters.department}
              onChange={(e) => onChange({ ...filters, department: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-slate-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any</option>
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
        className="w-full rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-extrabold text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition"
      >
        Reset filters
      </button>
    </div>
  );
}

