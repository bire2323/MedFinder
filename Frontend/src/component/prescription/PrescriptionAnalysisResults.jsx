// 
import React from "react";
import { useTranslation } from "react-i18next";
import { Pill, Store, Stethoscope } from "lucide-react";
import SurfaceCard from "../ui/SurfaceCard";

export default function PrescriptionAnalysisResults({ results }) {
  const { t } = useTranslation();

  const filename = results?.status === "success" && results.filename;
  const drugs = Array.isArray(results?.clinical_analysis?.medicines) ? results.clinical_analysis.medicines : [];
  const pharmacies = Array.isArray(results?.nearby_facilities) ? results.nearby_facilities : [];
  const explanation = typeof results?.clinical_analysis?.explanation === "string" ? results?.clinical_analysis?.explanation : "";

  return (
    <div className="space-y-6">
      {explanation && (
        <SurfaceCard className="p-5 sm:p-6 border-l-4 border-emerald-500">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.analysisHeader")}</h3>
          </div>
          <div className="text-sm font-medium text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
            {explanation}
          </div>
        </SurfaceCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Pill className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.resultsDrugsTitle")}</h3>
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
            {drugs.length > 0 ? t("prescriptionReader.detectedMedications") : t("prescriptionReader.resultsPlaceholderNote")}
          </p>
          
          <ul className="space-y-2">
            {drugs.length > 0 ? (
              drugs.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
                >
                  {name}
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">{t("prescriptionReader.noMedications")}</li>
            )}
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
            {pharmacies.length > 0 ? t("prescriptionReader.foundNearby") : t("prescriptionReader.resultsPlaceholderNote")}
          </p>
          <ul className="space-y-3">
            {pharmacies.length === 1 && (pharmacies[0].message !== undefined || pharmacies[0].error !== undefined) ? (
              <li className="text-sm text-slate-500">{pharmacies[0].message || pharmacies[0].error}</li>
            ) : pharmacies.length > 0 ? (
              pharmacies.map((row, i) => (
                <li key={`${row.name || row.pharmacy || row.drug || i}-${i}`}>
                  <SurfaceCard className="border-emerald-100 bg-white p-4 dark:border-emerald-900/40 dark:bg-slate-900/90">
                    <p className="font-bold text-slate-900 dark:text-white">{row.name || row.pharmacy || row.drug || t("prescriptionReader.unknownPharmacy")}</p>
                    {row.note && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.note}</p>}
                    {row.address && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.address}</p>}
                    {row.price !== undefined && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{t("prescriptionReader.priceLabel", { price: row.price })}</p>
                    )}
                    {row.stock !== undefined && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{t("prescriptionReader.stockLabel", { stock: row.stock })}</p>
                    )}
                  </SurfaceCard>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">{t("prescriptionReader.noPharmacies")}</li>
            )}
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}


// import React from "react";
// import { useTranslation } from "react-i18next";
// import { Pill, Store, Stethoscope } from "lucide-react";
// import SurfaceCard from "../ui/SurfaceCard";

// export default function PrescriptionAnalysisResults({ results }) {
//   const { t } = useTranslation();

//   const drugs = results?.detected_medicines || [];
//   const pharmacies = results?.nearby_pharmacies || [];
//   const explanation = results?.response || "";

//   return (
//     <div className="space-y-6">
//       {explanation && (
//         <SurfaceCard className="p-5 sm:p-6 border-l-4 border-emerald-500">
//           <div className="mb-4 flex items-center gap-2">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
//               <Stethoscope className="h-5 w-5" aria-hidden />
//             </span>
//             <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.analysisHeader")}</h3>
//           </div>
//           <div className="text-sm font-medium text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
//             {explanation}
//           </div>
//         </SurfaceCard>
//       )}

//       <div className="grid gap-6 lg:grid-cols-2">
//         <SurfaceCard className="p-5 sm:p-6">
//           <div className="mb-4 flex items-center gap-2">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
//               <Pill className="h-5 w-5" aria-hidden />
//             </span>
//             <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.resultsDrugsTitle")}</h3>
//           </div>
//           <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
//             {drugs.length > 0 ? t("prescriptionReader.detectedMedications") : t("prescriptionReader.resultsPlaceholderNote")}
//           </p>
//           <ul className="space-y-2">
//             {drugs.length > 0 ? (
//               drugs.map((name, i) => (
//                 <li
//                   key={`${name}-${i}`}
//                   className="rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
//                 >
//                   {name}
//                 </li>
//               ))
//             ) : (
//               <li className="text-sm text-slate-500">{t("prescriptionReader.noMedications")}</li>
//             )}
//           </ul>
//         </SurfaceCard>

//         <SurfaceCard className="p-5 sm:p-6">
//           <div className="mb-4 flex items-center gap-2">
//             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
//               <Store className="h-5 w-5" aria-hidden />
//             </span>
//             <h3 className="text-lg font-black text-slate-900 dark:text-white">{t("prescriptionReader.resultsPharmaciesTitle")}</h3>
//           </div>
//           <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
//             {pharmacies.length > 0 ? t("prescriptionReader.foundNearby") : t("prescriptionReader.resultsPlaceholderNote")}
//           </p>
//           <ul className="space-y-3">
//             {pharmacies.length === 1 && pharmacies[0].message !== undefined ? (
//               <li className="text-sm text-slate-500">{pharmacies[0].message}</li>
//             ) : (
//               pharmacies.map((row, i) => (
//                 <li key={`${row.name || row}-${i}`}>
//                   <SurfaceCard className="border-emerald-100 bg-white p-4 dark:border-emerald-900/40 dark:bg-slate-900/90">
//                     <p className="font-bold text-slate-900 dark:text-white">{row.name || row}</p>
//                     {row.note && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.note}</p>}
//                     {row.address && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.address}</p>}
//                   </SurfaceCard>
//                 </li>
//               ))
//             )}

//             {pharmacies.length > 1 ? (
//               pharmacies.map((row, i) => (
//                 <li key={`${row.name || row}-${i}`}>
//                   <SurfaceCard className="border-emerald-100 bg-white p-4 dark:border-emerald-900/40 dark:bg-slate-900/90">
//                     <p className="font-bold text-slate-900 dark:text-white">{row.name || row}</p>
//                     {row.note && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.note}</p>}
//                     {row.address && <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">{row.address}</p>}
//                   </SurfaceCard>
//                 </li>
//               ))
//             ) : (
//               <li className="text-sm text-slate-500">{t("prescriptionReader.noPharmacies")}</li>
//             )}
//           </ul>
//         </SurfaceCard>
//       </div>
//     </div>
//   );
// }
