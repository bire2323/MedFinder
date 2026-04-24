import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../component/Header";
import SurfaceCard from "../../component/ui/SurfaceCard";
import PrescriptionUploadZone from "../../component/prescription/PrescriptionUploadZone";
import PrescriptionFilePreview from "../../component/prescription/PrescriptionFilePreview";
import PrescriptionAnalysisResults from "../../component/prescription/PrescriptionAnalysisResults";

const ACCEPT_ATTR = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";

function validatePrescriptionFile(file, t) {
  if (!file) return t("prescriptionReader.errorNoFile");
  const okMime = ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const okExt = ["jpg", "jpeg", "png", "pdf"].includes(ext);
  if (!okMime && !okExt) return t("prescriptionReader.errorInvalidType");
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) return t("prescriptionReader.errorTooLarge");
  return null;
}

export default function PrescriptionReader() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetPreviewUrl = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  }, []);

  const handleFile = useCallback(
    (next) => {
      setError("");
      setShowResults(false);
      const msg = validatePrescriptionFile(next, t);
      if (msg) {
        setError(msg);
        return;
      }
      resetPreviewUrl();
      setFile(next);
      const isImage = next.type.startsWith("image/");
      setPreviewUrl(isImage ? URL.createObjectURL(next) : "");
    },
    [resetPreviewUrl, t]
  );

  const handleRemove = useCallback(() => {
    resetPreviewUrl();
    setFile(null);
    setError("");
    setShowResults(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [resetPreviewUrl]);

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleHiddenInputChange = useCallback(
    (e) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleClearAll = useCallback(() => {
    handleRemove();
    setIsAnalyzing(false);
  }, [handleRemove]);

  const handleAnalyze = useCallback(() => {
    if (!file) return;
    setError("");
    setIsAnalyzing(true);
    setShowResults(false);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1600);
  }, [file]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white transition-colors dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <header className="mb-8 text-center sm:mb-10">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">{t("prescriptionReader.pageTitle")}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-slate-600 dark:text-gray-400">{t("prescriptionReader.pageSubtitle")}</p>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={handleHiddenInputChange}
          />

                    <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-bold mb-1">{t("prescriptionReader.disclaimerTitle", "Disclaimer")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("prescriptionReader.disclaimer1", "This prescription reader is for informational purposes only.")}</li>
              <li>{t("prescriptionReader.disclaimer2", "Results may not be 100% accurate.")}</li>
              <li>{t("prescriptionReader.disclaimer3", "Always consult a licensed healthcare professional.")}</li>
            </ul>
          </div>
          <SurfaceCard className="p-4 shadow-xl sm:p-6">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-gray-400">{t("prescriptionReader.uploadSectionTitle")}</h2>
            <PrescriptionUploadZone
              onFileSelected={handleFile}
              onBrowseClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            />
          </SurfaceCard>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" role="alert">
              {error}
            </div>
          )}

          {file && (
            <SurfaceCard className="mt-6 p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-gray-400">{t("prescriptionReader.previewSectionTitle")}</h2>
              <PrescriptionFilePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} onReplace={handleReplace} />
            </SurfaceCard>
          )}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:max-w-xs"
            >
              {isAnalyzing ? t("prescriptionReader.analyzing") : t("prescriptionReader.analyzeButton")}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isAnalyzing}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 border-emerald-600 bg-transparent px-8 py-3 text-sm font-black uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-40 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/40 sm:max-w-xs"
            >
              {t("prescriptionReader.clearButton")}
            </button>
          </div>

          {isAnalyzing && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent dark:border-emerald-400" aria-hidden />
              <p className="text-sm font-semibold text-slate-600 dark:text-gray-400">{t("prescriptionReader.analyzingHint")}</p>
            </div>
          )}

          {!file && !error && (
            <p className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-gray-500">{t("prescriptionReader.emptyNoFile")}</p>
          )}

          {showResults && !isAnalyzing && (
            <section className="mt-12">
              <h2 className="mb-6 text-center text-xl font-black text-slate-900 dark:text-white">{t("prescriptionReader.resultsSectionTitle")}</h2>
              <PrescriptionAnalysisResults
                drugs={[t("prescriptionReader.mockDrug1"), t("prescriptionReader.mockDrug2"), t("prescriptionReader.mockDrug3")]}
                pharmacies={[
                  { name: t("prescriptionReader.mockPharmacy1"), note: t("prescriptionReader.mockPharmacyNote") },
                  { name: t("prescriptionReader.mockPharmacy2"), note: "" },
                ]}
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}

