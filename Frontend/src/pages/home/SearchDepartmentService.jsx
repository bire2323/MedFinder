import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";

import Header from "../../component/Header";
import ResultCard from "../../component/search/ResultCard";
import ResultsSkeleton from "../../component/search/ResultsSkeleton";
import DepartmentServiceFilterSidebar from "../../component/departmentService/DepartmentServiceFilterSidebar";
import {
  apiFetchHospitalCapabilities,
  apiFetchPublicDepartments,
  apiFetchPublicServices,
} from "../../api/hospitalDirectory";
import useLocationStore from "../../store/useLocationStore";
import getDistanceFromLatLonInMeters from "../../utils/GetDistanceFromLatLoInMeters";

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

function hospitalMatchesKeyword(facility, keyword) {
  const q = (keyword || "").trim().toLowerCase();
  if (!q) return true;
  const nameHay = `${facility.hospital_name_en || ""} ${facility.hospital_name_am || ""} ${facility.name || ""}`.toLowerCase();
  if (nameHay.includes(q)) return true;
  for (const d of facility.departments || []) {
    const n = `${d.department_name_en || ""} ${d.department_name_am || ""}`.toLowerCase();
    if (n.includes(q)) return true;
  }
  for (const s of facility.services || []) {
    const n = `${s.service_name_en || ""} ${s.service_name_am || ""}`.toLowerCase();
    if (n.includes(q)) return true;
  }
  return false;
}

function hospitalMatchesDeptIds(facility, ids) {
  if (!ids.length) return true;
  const hospDeptIds = new Set((facility.departments || []).map((d) => d.id));
  return ids.some((id) => hospDeptIds.has(id));
}

function hospitalMatchesServiceIds(facility, ids) {
  if (!ids.length) return true;
  const hospSvcIds = new Set((facility.services || []).map((s) => s.id));
  return ids.some((id) => hospSvcIds.has(id));
}

export default function SearchDepartmentService() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const langIsAm = i18n.language === "am";

  const { coordinates: userLoc } = useLocationStore();

  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [distance, setDistance] = useState("any");
  const [selectedDeptIds, setSelectedDeptIds] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  const [allHospitals, setAllHospitals] = useState([]);
  const [departmentRows, setDepartmentRows] = useState([]);
  const [serviceRows, setServiceRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    const id = routeLocation.hash?.replace(/^#/, "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [routeLocation.hash]);

  useEffect(() => {
    setLoading(true);
    setMetaLoading(true);
    setError("");
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    Promise.all([
      apiFetchHospitalCapabilities({ signal: ac.signal }),
      apiFetchPublicDepartments({ signal: ac.signal }),
      apiFetchPublicServices({ signal: ac.signal }),
    ])
      .then(([hospitals, depts, svcs]) => {
        setAllHospitals(hospitals);
        setDepartmentRows(depts);
        setServiceRows(svcs);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setError(e?.message || t("departmentServiceSearch.loadError"));
      })
      .finally(() => {
        setLoading(false);
        setMetaLoading(false);
      });

    return () => ac.abort();
  }, [t]);

  const departmentOptions = useMemo(() => {
    return departmentRows.map((d) => ({
      id: d.id,
      label: langIsAm ? d.department_name_am || d.department_name_en : d.department_name_en || d.department_name_am,
    }));
  }, [departmentRows, langIsAm]);

  const serviceOptions = useMemo(() => {
    return serviceRows.map((s) => ({
      id: s.id,
      label: langIsAm ? s.service_name_am || s.service_name_en : s.service_name_en || s.service_name_am,
    }));
  }, [serviceRows, langIsAm]);

  const hospitalsWithDistance = useMemo(() => {
    if (!userLoc) return allHospitals.map((h) => ({ ...h, distanceMeters: NaN }));
    return allHospitals.map((h) => {
      const canCompute = Number.isFinite(h.lat) && Number.isFinite(h.lng);
      const distanceMeters = canCompute
        ? getDistanceFromLatLonInMeters(userLoc.lat, userLoc.lng, h.lat, h.lng)
        : NaN;
      return { ...h, distanceMeters };
    });
  }, [allHospitals, userLoc]);

  const filtered = useMemo(() => {
    return hospitalsWithDistance
      .filter((h) => hospitalMatchesKeyword(h, appliedKeyword))
      .filter((h) => hospitalMatchesDeptIds(h, selectedDeptIds))
      .filter((h) => hospitalMatchesServiceIds(h, selectedServiceIds))
      .filter((h) => distanceBucketOk(h.distanceMeters, distance))
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
  }, [hospitalsWithDistance, appliedKeyword, selectedDeptIds, selectedServiceIds, distance]);

  const onSearch = () => setAppliedKeyword(keyword);

  const toggleDepartment = (id) => {
    setSelectedDeptIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleService = (id) => {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const resetFilters = () => {
    setKeyword("");
    setAppliedKeyword("");
    setDistance("any");
    setSelectedDeptIds([]);
    setSelectedServiceIds([]);
  };

  const onCardClick = (h) => navigate(`/hospital/${h.id}`);

  const sidebar = (
    <DepartmentServiceFilterSidebar
      departments={departmentOptions}
      services={serviceOptions}
      selectedDeptIds={selectedDeptIds}
      selectedServiceIds={selectedServiceIds}
      onToggleDepartment={toggleDepartment}
      onToggleService={toggleService}
      distance={distance}
      onDistanceChange={setDistance}
      onReset={resetFilters}
      labelDept={t("departmentServiceSearch.departments")}
      labelSvc={t("departmentServiceSearch.services")}
    />
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        <div className="mx-auto max-w-[1780px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">


          {/* Search row */}
          <div className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-lg backdrop-blur dark:border-emerald-900/40 dark:bg-slate-900/90">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                    {t("departmentServiceSearch.keywordLabel")}
                  </span>
                  <input
                    type="search"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    placeholder={t("departmentServiceSearch.keywordPlaceholder")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </label>

                <div id="nav-departments" className="scroll-mt-28">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                      {t("departmentServiceSearch.departmentDropdown")}
                    </span>
                    <select
                      value={selectedDeptIds.length === 1 ? selectedDeptIds[0] : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedDeptIds(v ? [Number(v)] : []);
                      }}
                      disabled={metaLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">{t("departmentServiceSearch.anyDepartment")}</option>
                      {departmentOptions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div id="nav-services" className="scroll-mt-28">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                      {t("departmentServiceSearch.serviceDropdown")}
                    </span>
                    <select
                      value={selectedServiceIds.length === 1 ? selectedServiceIds[0] : ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedServiceIds(v ? [Number(v)] : []);
                      }}
                      disabled={metaLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">{t("departmentServiceSearch.anyService")}</option>
                      {serviceOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                    {t("departmentServiceSearch.distanceDropdown")}
                  </span>
                  <select
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="any">{t("filters.distance.any")}</option>
                    <option value="lt1">{t("filters.distance.lt1")}</option>
                    <option value="1to5">{t("filters.distance.1to5")}</option>
                    <option value="5to10">{t("filters.distance.5to10")}</option>
                    <option value="gt10">{t("filters.distance.gt10")}</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={onSearch}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-sm font-black uppercase tracking-wide text-white shadow-md transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {t("departmentServiceSearch.searchButton")}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          )}

          {!userLoc && (
            <p className="mt-4 text-xs font-medium text-slate-500 dark:text-gray-400">{t("search.enableLocationHint")}</p>
          )}

          <div className="mt-8 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200"
            >
              <Filter className="h-4 w-4" aria-hidden />
              {t("departmentServiceSearch.filtersToggle")}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <aside className="hidden lg:col-span-4 xl:col-span-3 lg:block">
              <div className="sticky top-24 rounded-2xl border border-emerald-100 bg-white p-5 shadow-lg dark:border-emerald-900/40 dark:bg-slate-900">
                {sidebar}
              </div>
            </aside>

            <div className="lg:col-span-8 xl:col-span-9">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">
                  {t("departmentServiceSearch.resultsLabel", { count: filtered.length })}
                </p>
              </div>

              {loading ? (
                <ResultsSkeleton count={6} />
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-16 text-center dark:border-emerald-900 dark:bg-emerald-950/20">
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{t("departmentServiceSearch.emptyTitle")}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-gray-400">{t("departmentServiceSearch.emptyBody")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((h) => (
                    <div key={h.id} className="min-h-[420px]">
                      <ResultCard
                        facility={h}
                        onClick={() => onCardClick(h)}
                        maxTags={8}
                        tagSource="both"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label={t("common.close")}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-emerald-100 bg-white p-5 shadow-2xl dark:border-emerald-900 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("departmentServiceSearch.filtersTitle")}</h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 dark:border-gray-700 dark:text-gray-200"
                >
                  {t("common.close")}
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
