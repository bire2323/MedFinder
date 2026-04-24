import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, ImageIcon, Trash2, RefreshCw } from "lucide-react";

export default function PrescriptionFilePreview({ file, previewUrl, onRemove, onReplace }) {
  const { t } = useTranslation();
  const isPdf = file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
      <div className="flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-gray-700 dark:bg-slate-950">
        {isPdf ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <FileText className="h-14 w-14 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <p className="text-sm font-bold text-slate-800 dark:text-white">{file?.name}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{t("prescriptionReader.pdfPreviewNote")}</p>
          </div>
        ) : previewUrl ? (
          <img src={previewUrl} alt="" className="max-h-[280px] w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-gray-400">
            <ImageIcon className="h-12 w-12" aria-hidden />
            <span className="text-sm">{file?.name}</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col justify-center gap-3 sm:w-44">
        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {t("prescriptionReader.replaceFile")}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-gray-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t("prescriptionReader.removeFile")}
        </button>
      </div>
    </div>
  );
}
