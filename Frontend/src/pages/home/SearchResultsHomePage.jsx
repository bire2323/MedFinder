import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGrid, List } from "lucide-react";

import Header from "../../component/Header";
import SearchBar from "../../component/search/SearchBar";
import FilterPanel from "../../component/search/FilterPanel";
import ResultCard from "../../component/search/ResultCard";
import ResultsSkeleton from "../../component/search/ResultsSkeleton";

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

  const { coordinates: userLoc } = useLocationStore();

  const initialQ = params.get("q") || "";
  const initialType = (params.get("type") || "all").toLowerCase();

  const [query, setQuery] = useState(initialQ);
  const debouncedQuery = useDebouncedValue(query, 250);

  const [facilityType, setFacilityType] = useState(
    initialType === "hospital" || initialType === "pharmacy" ? initialType : "all"
  );

  const [filters, setFilters] = useState({
    distance: "any",
    type: initialType === "hospital" || initialType === "pharmacy" ? initialType : "all",
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
      fetchAction = !debouncedQuery.trim()
        ? Promise.resolve([])
        : apiFetchDrugResults(debouncedQuery, { signal: ac.signal });
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
      setLoading(true);
      setError("");
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      apiFetchDrugResults(debouncedQuery, { signal: ac.signal })
        .then((rows) => setAllFacilities(rows))
        .then((rows) => console.log(rows))
        .catch((e) => {
          if (e?.name === "AbortError") return;
          setError(e?.message || t("search.errors.failedToLoad"));
        })
        .finally(() => setLoading(false));

      return () => ac.abort();
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

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
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
            </main>
          </div>
        </div>
      </div>
    </>
  );
}