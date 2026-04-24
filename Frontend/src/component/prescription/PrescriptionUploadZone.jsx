import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileUp } from "lucide-react";

export default function PrescriptionUploadZone({ onFileSelected, onBrowseClick, disabled }) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      if (disabled) return;
      const f = e.dataTransfer?.files?.[0];
      if (f) onFileSelected(f);
    },
    [disabled, onFileSelected]
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onBrowseClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group relative w-full rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
        isDragging
          ? "border-emerald-500 bg-emerald-50/90 dark:border-emerald-400 dark:bg-emerald-950/50"
          : "border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-slate-600 dark:bg-slate-900/50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner ring-1 ring-emerald-200/80 transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-950/60 dark:text-emerald-400 dark:ring-emerald-800">
          <FileUp className="h-8 w-8" aria-hidden />
        </span>
        <div>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">{t("prescriptionReader.dropTitle")}</p>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-gray-400">{t("prescriptionReader.dropHint")}</p>
          <p className="mt-3 text-xs text-slate-500 dark:text-gray-500">{t("prescriptionReader.acceptedFormats")}</p>
        </div>
      </div>
    </button>
  );
}
