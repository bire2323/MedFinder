import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Trash2, RefreshCw, Clock3 } from "lucide-react";
import SurfaceCard from "../../../component/ui/SurfaceCard";
import PrescriptionUploadZone from "../../../component/prescription/PrescriptionUploadZone";
import PrescriptionFilePreview from "../../../component/prescription/PrescriptionFilePreview";
import PrescriptionAnalysisResults from "../../../component/prescription/PrescriptionAnalysisResults";

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

function formatDateTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function Prescription() {
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
    const stored = safeParseJSON(localStorage.getItem(LS_PRESCRIPTION_HISTORY_KEY), []);
    setHistory(Array.isArray(stored) ? stored : []);
  }, []);

  useEffect(() => {
    if (previewUrl) {
      return () => URL.revokeObjectURL(previewUrl);
    }
    return undefined;
  }, [previewUrl]);

  const persistHistory = useCallback((nextHistory) => {
    localStorage.setItem(LS_PRESCRIPTION_HISTORY_KEY, JSON.stringify(nextHistory));
    setHistory(nextHistory);
  }, []);

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
      const next = e.target.files?.[0];
      if (next) handleFile(next);
    },
    [handleFile]
  );

  const addHistoryEntry = useCallback(
    (entry) => {
      const next = [entry, ...history].slice(0, 20);
      persistHistory(next);
      setSelectedHistoryId(entry.id);
    },
    [history, persistHistory]
  );

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white px-6 py-7 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-white/5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                    {t("prescriptionReader.pageSubtitle")}
                  </p>
                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {t("prescriptionReader.pageTitle")}
                  </h1>
                </div>
                <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-5 w-5" />
                    <span>{t("prescriptionReader.historyQuickAccess")}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                {t("prescriptionReader.dashboardHint")}
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-white/5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("prescriptionReader.uploadSectionTitle")}
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={handleHiddenInputChange}
              />
              <PrescriptionUploadZone
                onFileSelected={handleFile}
                onBrowseClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              />

              {error && (
                <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200" role="alert">
                  {error}
                </div>
              )}

              {file && (
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <PrescriptionFilePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} onReplace={handleReplace} />
                </div>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAnalyzing ? t("prescriptionReader.analyzing") : t("prescriptionReader.analyzeButton")}
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-wider text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("prescriptionReader.clearHistory")}
                </button>
              </div>
            </div>

            {(showResults || selectedHistory) && (
              <div className="rounded-[2rem] bg-white p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-white/5">
                <h2 className="mb-6 text-xl font-black text-slate-900 dark:text-white">
                  {selectedHistory ? t("prescriptionReader.historyResultTitle") : t("prescriptionReader.resultsSectionTitle")}
                </h2>
                <PrescriptionAnalysisResults results={selectedHistory ? selectedHistory.results : apiResults} />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <SurfaceCard className="rounded-[2rem] p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("prescriptionReader.historyTitle")}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                    {t("prescriptionReader.historySubtitle")}
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {history.length}
                </span>
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
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateTime(item.uploadedAt)}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
