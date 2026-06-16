import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGrid, List, AlertCircle } from "lucide-react";

import Header from "../../component/Header";
import SearchBar from "../../component/search/SearchBar";
import FilterPanel from "../../component/search/FilterPanel";
import ResultCard from "../../component/search/ResultCard";
import ResultsSkeleton from "../../component/search/ResultsSkeleton";
import Footer from "../../component/Footer";

import { apiFetchFacilities, apiFetchDrugResults } from "../../api/search";
import { apiGetFacilities } from "../../api/hospital";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";
import FeatureCarousel from "../../component/search/FeatureCarousel";

function useDebouncedValue(value, delayMs = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function matchesQuery(facility, q) {
  if (!q) return true;
  const hay = `${facility.name || ""} ${facility.address || ""} ${facility.drugName || ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

function distanceBucketOk(distanceMeters, bucket) {
  if (!bucket || bucket === "any") return true;
  if (!Number.isFinite(distanceMeters)) return false;
  const km = distanceMeters / 1000;
  if (bucket === "lt1") return km < 1;
  if (bucket === "1to5") return km >= 1 && km <= 5;
  if (bucket === "5to10") return km > 5 && km <= 10;
  if (bucket === "gt10") return km > 10;
  return true;
}

import useLocationStore from "../../store/useLocationStore";

export default function SearchResultsHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const { coordinates: userLoc, permissionState, permissionError } = useLocationStore();

  const initialQ = params.get("q") || "";
  const initialType = (params.get("type") || "all").toLowerCase();
  const [query, setQuery] = useState(initialQ);
  const debouncedQuery = useDebouncedValue(query, 250);

  // State for permission alert
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  // Allow 'drug' as a valid incoming type from the URL so hero searches work
  const validTypes = ["hospital", "pharmacy", "drug", "all"];
  const initialFacilityType = validTypes.includes(initialType) ? initialType : "all";

  const [facilityType, setFacilityType] = useState(initialFacilityType);

  const [filters, setFilters] = useState({
    distance: "any",
    // keep filters.type in sync with the initial URL; allow 'drug' here too
    type: validTypes.includes(initialType) && initialType !== 'all' ? initialType : "all",
    openNow: false,
    department: "any",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allFacilities, setAllFacilities] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Pagination State
  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  const abortRef = useRef(null);

  // Check location permission for hospital/pharmacy search
  useEffect(() => {
    if ((facilityType === "hospital" || facilityType === "pharmacy") && permissionState === "denied") {
      alert("you are not grant location and Location Features Stop Working");
      setShowPermissionAlert(true);
    }
  }, [facilityType, permissionState]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set("q", query || "");
    next.set("type", facilityType);
    setParams(next, { replace: true });
  }, [query, facilityType, params, setParams]);

  useEffect(() => {
    setLoading(true);
    setError("");
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    let fetchAction;
    if (facilityType === "drug") {
      fetchAction = apiFetchDrugResults(debouncedQuery, { signal: ac.signal });
    } else {
      fetchAction = apiFetchFacilities({ signal: ac.signal });
    }

    fetchAction
      .then((rows) => setAllFacilities(rows))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(e?.message || t("search.errors.failedToLoad"));
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [t, debouncedQuery, facilityType]);
  // console.log("Fetched facilities:", allFacilities);
  const facilitiesWithDistance = useMemo(() => {
    if (!userLoc) return allFacilities.map((f) => ({ ...f, distanceMeters: NaN }));
    return allFacilities.map((f) => {
      const canCompute = Number.isFinite(f.lat) && Number.isFinite(f.lng);
      const distanceMeters = canCompute
        ? getDistanceFromLatLonInMeters(userLoc.lat, userLoc.lng, f.lat, f.lng)
        : NaN;
      return { ...f, distanceMeters };
    });
  }, [allFacilities, userLoc]);

  const availableDepartments = useMemo(() => {
    const set = new Set();
    facilitiesWithDistance.forEach((f) => {
      if (f.type !== "hospital") return;
      const list = (f.departments?.length ? f.departments : f.services) || [];
      list.forEach((d) => {
        const name = typeof d === "string" ? d : d?.name || d?.department_name_en || d?.service_name_en;
        if (name) set.add(name);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [facilitiesWithDistance]);

  const filtered = useMemo(() => {
    const effectiveType = filters.type || facilityType;
    const q = (debouncedQuery || "").trim();
    if (filters.type === "drug") {
      return facilitiesWithDistance
        .filter((f) => matchesQuery(f, q))
        .filter((f) => {
          if (effectiveType === "all") return true;
          if (effectiveType === "drug") return f.type === "pharmacy";
          return f.type === effectiveType;
        })
        .filter((f) => distanceBucketOk(f.distanceMeters, filters.distance))
        .filter((f) => (filters.openNow ? Boolean(f.isFullTime || f.isOpen === true) : true))
        .filter((f) => {
          if (filters.department === "any") return true;
          if (f.type !== "hospital") return true;
          const list = (f.departments?.length ? f.departments : f.services) || [];
          return list.some((d) => {
            const name = typeof d === "string" ? d : d?.name || d?.department_name_en || d?.service_name_en;
            return name === filters.department;
          });
        })
        .sort((a, b) => {
          const da = a.distanceMeters;
          const db = b.distanceMeters;
          const aOk = Number.isFinite(da);
          const bOk = Number.isFinite(db);
          if (aOk && bOk) return da - db;
          if (aOk) return -1;
          if (bOk) return 1;
          return (a.name || "").localeCompare(b.name || "");
        });
    } else {
      return facilitiesWithDistance
        .filter((f) => matchesQuery(f, q))
        .filter((f) => {
          if (effectiveType === "all") return true;
          if (effectiveType === "drug") return f.type === "pharmacy"; // Drug results are pharmacies
          return f.type === effectiveType;
        })
        .filter((f) => distanceBucketOk(f.distanceMeters, filters.distance))
        .filter((f) => (filters.openNow ? Boolean(f.isFullTime || f.isOpen === true) : true))
        .filter((f) => {
          if (filters.department === "any") return true;
          if (f.type !== "hospital") return true;
          const list = (f.departments?.length ? f.departments : f.services) || [];
          return list.some((d) => {
            const name = typeof d === "string" ? d : d?.name || d?.department_name_en || d?.service_name_en;
            return name === filters.department;
          });
        })
        .sort((a, b) => {
          const da = a.distanceMeters;
          const db = b.distanceMeters;
          const aOk = Number.isFinite(da);
          const bOk = Number.isFinite(db);
          if (aOk && bOk) return da - db;
          if (aOk) return -1;
          if (bOk) return 1;
          return (a.name || "").localeCompare(b.name || "");
        });
    }
  }, [debouncedQuery, facilitiesWithDistance, facilityType, filters]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, filters]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResults = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const onSubmitSearch = () => {
    if (facilityType === "drug") {
      const drugQuery = query.trim();
      setLoading(true);
      setError("");
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      apiFetchDrugResults(drugQuery, { signal: ac.signal })
        .then((rows) => setAllFacilities(rows))
        .then((rows) => console.log(rows))
        .catch((e) => {
          if (e?.name === "AbortError") return;
          setError(e?.message || t("search.errors.failedToLoad"));
        })
        .finally(() => setLoading(false));
    }
  };

  const onCardClick = (f) => {
    if (f.type === "hospital") navigate(`/hospital/${f.id}`);
    else if (f.type === "pharmacy") navigate(`/pharmacy/${f.id}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-[1780px] mx-auto px-6 lg:px-12 py-8 sm:py-12">

          {/* 1. FEATURE CAROUSEL */}
          <FeatureCarousel />

          {/* 2. SEARCH BAR SECTION */}
          <div className="rounded-2xl border border-slate-200 dark:border-blue-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur p-4 shadow-xl">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={onSubmitSearch}
              facilityType={facilityType}
              onFacilityTypeChange={(t) => {
                setFacilityType(t);
                setFilters((prev) => ({ ...prev, type: t }));
              }}
              placeholder={t("search.placeholder")}
            />
          </div>

          <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Column */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-blue-900/30 bg-white dark:bg-slate-900 p-5 shadow-lg">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  availableDepartments={availableDepartments}
                  showDepartments
                />
              </div>
            </aside>

            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/30 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold text-slate-800 dark:text-white"
              >
                {t("search.filtersButton")}
              </button>
            </div>

            {mobileFiltersOpen && (
              <div className="lg:hidden fixed inset-0 z-50">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-white dark:bg-gray-900 p-5 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t("search.filtersTitle")}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="rounded-xl px-3 py-2 text-sm font-bold border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200"
                    >
                      {t("common.close")}
                    </button>
                  </div>
                  <div className="mt-5">
                    <FilterPanel
                      filters={filters}
                      onChange={setFilters}
                      availableDepartments={availableDepartments}
                      showDepartments
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Column */}
            <main className="lg:col-span-9">
              {/* Show permission denied error for hospital/pharmacy search */}
              {(facilityType === "hospital" || facilityType === "pharmacy") && permissionState === "denied" && (
                <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">
                    Location Permission Denied
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    {facilityType === "hospital" 
                      ? "Hospital search requires your location to provide accurate results and nearby facilities."
                      : "Pharmacy search requires your location to show nearby pharmacies and distances."}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mb-6">
                    Please enable location access in your browser settings and refresh the page to use this feature.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-5 py-3 text-sm font-bold"
                    >
                      Refresh Page
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 px-5 py-3 text-sm font-bold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-gray-800"
                    >
                      Go to Home
                    </button>
                  </div>
                </div>
              )}

              {/* Show normal search results only if permission is granted or not hospital/pharmacy search */}
              {!((facilityType === "hospital" || facilityType === "pharmacy") && permissionState === "denied") && (
                <>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t("search.resultsTitle")}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {userLoc
                      ? t("search.sortedByDistance")
                      : t("search.enableLocationHint")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-900/30">
                    {loading
                      ? t("common.loading")
                      : t("search.resultCount", { count: filtered.length })}
                  </div>

                  {/* View Mode Toggler */}
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${viewMode === "grid" ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                      title="Grid View"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${viewMode === "list" ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                      title="List View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 p-4 text-sm text-rose-800 dark:text-rose-200 mb-6">
                  {error}
                </div>
              )}

              {!error && loading && <ResultsSkeleton />}

              {!error && !loading && filtered.length === 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("search.noMatchesTitle")}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                    {t("search.noMatchesMessage")}
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setFilters({ distance: "any", type: "all", openNow: false, department: "any" });
                        setFacilityType("all");
                      }}
                      className="rounded-xl bg-green-800 hover:bg-green-700 dark:bg-slate-500 dark:hover:bg-slate-400 text-white px-5 py-3 text-sm font-bold"
                    >
                      {t("search.clearFiltersButton")}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/home/map")}
                      className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-bold text-slate-800 dark:text-white"
                    >
                      {t("search.exploreOnMap")}
                    </button>
                  </div>
                </div>
              )}

              {!error && !loading && filtered.length > 0 && (
                <>
                  {console.log("Rendering paginated results:", paginatedResults)}
                  <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                    {paginatedResults.map((f) => (
                      <ResultCard key={`${f.type}-${f.id}`} facility={f} onClick={() => onCardClick(f)} viewMode={viewMode} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {t("common.previous")}
                      </button>

                      <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          // Basic pagination logic: show current, first, last, and neighbors
                          const isNear = Math.abs(currentPage - pageNum) <= 1;
                          const isEnd = pageNum === 1 || pageNum === totalPages;

                          if (!isNear && !isEnd) {
                            if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                            return null;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                                : "border border-slate-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {t("common.next")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
          </div>
        </div>
      </div>
      <div className="min-h-20 bg-slate-50 dark:bg-slate-950">

      </div>
      
      {/* Permission Alert Modal */}
      {showPermissionAlert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Location Permission Required
                </h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
                {permissionError || "Location access is not granted. Hospital and Pharmacy search features require your location to provide accurate results."}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  To use location-based search:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 ml-4">
                  <li>✓ Enable location permission in your browser</li>
                  <li>✓ Allow access to your device location</li>
                  <li>✓ Refresh the page to retry</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Or continue with <button onClick={() => navigate("/prescription-reader")} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">prescription reader</button> which doesn't require location.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 dark:border-gray-800 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPermissionAlert(false)}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPermissionAlert(false);
                  window.location.reload();
                }}
                className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}