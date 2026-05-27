import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../component/Header";
import SurfaceCard from "../../component/ui/SurfaceCard";
import PrescriptionUploadZone from "../../component/prescription/PrescriptionUploadZone";
import PrescriptionFilePreview from "../../component/prescription/PrescriptionFilePreview";
import PrescriptionAnalysisResults from "../../component/prescription/PrescriptionAnalysisResults";

const LS_PRESCRIPTION_HISTORY_KEY = "medfinder_prescription_history_v1";
const ACCEPT_ATTR = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";

function safeParseJSON(value, fallback) {
  try {
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

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

export default function PrescriptionReader({ showHeader = true }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiResults, setApiResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const selectedHistory = useMemo(
    () => history.find((item) => item.id === selectedHistoryId) ?? null,
    [history, selectedHistoryId]
  );

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
      setSelectedHistoryId(null);
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
    setApiResults(null);
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

  useEffect(() => {
    const stored = safeParseJSON(localStorage.getItem(LS_PRESCRIPTION_HISTORY_KEY), []);
    setHistory(Array.isArray(stored) ? stored : []);
  }, []);

  const persistHistory = useCallback((nextHistory) => {
    localStorage.setItem(LS_PRESCRIPTION_HISTORY_KEY, JSON.stringify(nextHistory));
    setHistory(nextHistory);
  }, []);

  const addHistoryEntry = useCallback(
    (entry) => {
      const next = [entry, ...history].slice(0, 20);
      persistHistory(next);
      setSelectedHistoryId(entry.id);
    },
    [history, persistHistory]
  );

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(LS_PRESCRIPTION_HISTORY_KEY);
    setHistory([]);
    setSelectedHistoryId(null);
  }, []);

  const handleViewHistory = useCallback((item) => {
    setSelectedHistoryId(item.id);
    setShowResults(false);
    setApiResults(null);
    setError("");
  }, []);

  const handleClearAll = useCallback(() => {
    handleRemove();
    setIsAnalyzing(false);
  }, [handleRemove]);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;
    setError("");
    setIsAnalyzing(true);
    setShowResults(false);
    setApiResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const baseUrl = import.meta.env.VITE_API_BASE || "";
      const response = await fetch(`${baseUrl}/ai/prescription`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t("prescriptionReader.errorApiFailed"));
      }

      const data = await response.json();
      setApiResults(data);
      setShowResults(true);

      const entry = {
        id: `${Date.now()}-${file.name}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        results: data,
      };
      addHistoryEntry(entry);
    } catch (err) {
      console.error("Prescription API Error:", err);
      setError(err.message || t("prescriptionReader.errorApiFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, addHistoryEntry, t]);

  return (
    <>
      {showHeader && <Header />}
      <div className="min-h-screen bg-white transition-colors dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <header className="mb-8 text-center sm:mb-10">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {t("prescriptionReader.pageTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium text-slate-600 dark:text-gray-400">
              {t("prescriptionReader.pageSubtitle")}
            </p>
          </header>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={handleHiddenInputChange}
          />

          <div className="mb-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-bold mb-1">{t("prescriptionReader.disclaimerTitle")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("prescriptionReader.disclaimer1")}</li>
              <li>{t("prescriptionReader.disclaimer2")}</li>
              <li>{t("prescriptionReader.disclaimer3")}</li>
            </ul>
          </div>

          <SurfaceCard className="p-4 shadow-xl sm:p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
              {t("prescriptionReader.uploadSectionTitle")}
            </h2>
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
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                {t("prescriptionReader.previewSectionTitle")}
              </h2>
              <PrescriptionFilePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} onReplace={handleReplace} />
            </SurfaceCard>
          )}

          <SurfaceCard className="mt-6 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                  {t("prescriptionReader.historyTitle")}
                </p>
                <h2 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                  {t("prescriptionReader.historySubtitle")}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {t("prescriptionReader.clearHistory")}
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {history.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                  {t("prescriptionReader.historyEmpty")}
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleViewHistory(item)}
                    className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950"
                  >
                    <div className="flex items-center justify-between gap-3 text-slate-900 dark:text-white">
                      <div>
                        <p className="font-bold">{item.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(item.uploadedAt).toLocaleString()}</p>
                      </div>
                      
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {item.results?.detected_medicines?.length > 0
                          ? t("prescriptionReader.historyHasResults")
                          : t("prescriptionReader.historySaved")}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </SurfaceCard>

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

          {(showResults && !isAnalyzing && apiResults) || selectedHistory ? (
            <section className="mt-12">
              <h2 className="mb-6 text-center text-xl font-black text-slate-900 dark:text-white">
                {selectedHistory ? t("prescriptionReader.historyResultTitle") : t("prescriptionReader.resultsSectionTitle")}
              </h2>
              <PrescriptionAnalysisResults results={selectedHistory ? selectedHistory.results : apiResults} />
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
