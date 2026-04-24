import React from "react";
import { useTranslation } from "react-i18next";
import { Pill, Store } from "lucide-react";
import SurfaceCard from "../ui/SurfaceCard";

/**
 * UI-only placeholder for future OCR / AI output.
 */
export default function PrescriptionAnalysisResults({ drugs, pharmacies }) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SurfaceCard className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Pill className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.resultsDrugsTitle")}</h3>
        </div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          {t("prescriptionReader.resultsPlaceholderNote")}
        </p>
        <ul className="space-y-2">
          {drugs.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              {name}
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Store className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.resultsPharmaciesTitle")}</h3>
        </div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          {t("prescriptionReader.resultsPlaceholderNote")}
        </p>
        <ul className="space-y-3">
          {pharmacies.map((row, i) => (
            <li key={`${row.name}-${i}`}>
              <SurfaceCard className="border-emerald-100 bg-white p-4 dark:border-emerald-900/40 dark:bg-slate-900/90">
                <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                {row.note && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.note}</p>}
              </SurfaceCard>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
