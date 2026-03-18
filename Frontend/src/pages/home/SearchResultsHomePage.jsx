import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Header from "../../component/Header";
import SearchBar from "../../component/search/SearchBar";
import FilterPanel from "../../component/search/FilterPanel";
import ResultCard from "../../component/search/ResultCard";
import ResultsSkeleton from "../../component/search/ResultsSkeleton";

import { apiFetchFacilities } from "../../api/search";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";

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
  const hay = `${facility.name || ""} ${facility.address || ""}`.toLowerCase();
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

export default function SearchResultsHomePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

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

  const [userLoc, setUserLoc] = useState(null); // {lat, lng}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allFacilities, setAllFacilities] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const abortRef = useRef(null);

  // Keep URL in sync (no reload)
  useEffect(() => {
    const next = new URLSearchParams(params);
    next.set("q", query || "");
    next.set("type", facilityType);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, facilityType]);

  // Load user location (optional)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLoc(null),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch facilities (cached per mount; abort on unmount)
  useEffect(() => {
    setLoading(true);
    setError("");
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    apiFetchFacilities({ signal: ac.signal })
      .then((rows) => setAllFacilities(rows))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Failed to load results.");
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

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
    return facilitiesWithDistance
      .filter((f) => matchesQuery(f, q))
      .filter((f) => (effectiveType === "all" ? true : f.type === effectiveType))
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
  }, [debouncedQuery, facilitiesWithDistance, facilityType, filters]);

  const onSubmitSearch = () => {
    // no-op; URL already updates as you type, but we keep this for UX parity
  };

  const onCardClick = (f) => {
    if (f.type === "hospital") navigate(`/hospital/${f.id}`);
    else if (f.type === "pharmacy") navigate(`/pharmacy/${f.id}`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={onSubmitSearch}
              facilityType={facilityType}
              onFacilityTypeChange={(t) => {
                setFacilityType(t);
                setFilters((prev) => ({ ...prev, type: t }));
              }}
              placeholder="Search hospitals or pharmacies by name or location..."
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  availableDepartments={availableDepartments}
                  showDepartments
                />
              </div>
            </aside>

            {/* Mobile filter button + drawer */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="w-full rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-extrabold text-slate-800 dark:text-white"
              >
                Filters
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
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Filters</h2>
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="rounded-xl px-3 py-2 text-sm font-bold border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200"
                    >
                      Close
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

            <main className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Search Results
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-gray-300">
                    {userLoc
                      ? "Sorted by distance (when available)."
                      : "Enable location to see distances and better sorting."}
                  </p>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                  {loading ? "Loading…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 p-4 text-sm text-rose-800 dark:text-rose-200">
                  {error}
                </div>
              )}

              {!error && loading && <ResultsSkeleton />}

              {!error && !loading && filtered.length === 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    No matches found
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                    Try a different keyword, widen the distance filter, or switch facility type.
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setFilters({ distance: "any", type: "all", openNow: false, department: "any" });
                        setFacilityType("all");
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-extrabold"
                    >
                      Clear search & filters
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/map")}
                      className="rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 text-sm font-extrabold text-slate-800 dark:text-white"
                    >
                      Explore on map
                    </button>
                  </div>
                </div>
              )}

              {!error && !loading && filtered.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {filtered.map((f) => (
                    <ResultCard key={`${f.type}-${f.id}`} facility={f} onClick={() => onCardClick(f)} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

