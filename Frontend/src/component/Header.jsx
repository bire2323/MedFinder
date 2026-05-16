import React, { useState, useEffect, useRef, useCallback } from "react";
import { HiMenuAlt3, HiOutlineLocationMarker } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { FaUser, FaUserCircle, FaMapMarkedAlt } from "react-icons/fa";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import { ChevronDown, Stethoscope, LayoutGrid, FileScan } from "lucide-react";
import { useTranslation } from "react-i18next";

import ThemeToggle from "./DarkLightTeam";
import LanguageSwitcher from "./LanguageSwitcher";
import { createPortal } from "react-dom";
import useAuthStore from "../store/UserAuthStore";
import { navigateByRole } from "../utils/UserNavigation";
import { apiLogout } from "../api/auth";
import am_white from "../assets/am_white.png";
import en_white from "../assets/en_white.png";

import useLocationStore from "../store/useLocationStore";

function FindCareLinkRows({ onNavigate, variant = "desktop" }) {
  const { t } = useTranslation();
  const baseRow =
    variant === "desktop"
      ? "flex gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 dark:text-gray-200 dark:hover:bg-emerald-950/50"
      : "flex gap-3 rounded-xl px-3 py-3 text-left text-base font-bold text-slate-800 transition-colors hover:bg-emerald-50 dark:text-white dark:hover:bg-emerald-950/40";

  const items = [
    {
      to: "/search-department-service#nav-departments",
      title: t("headingNav.findCareDepartments"),
      hint: t("headingNav.findCareDepartmentsHint"),
      Icon: Stethoscope,
    },
    {
      to: "/search-department-service#nav-services",
      title: t("headingNav.findCareServices"),
      hint: t("headingNav.findCareServicesHint"),
      Icon: LayoutGrid,
    },
    {
      to: "/prescription-reader",
      title: t("headingNav.findCarePrescription"),
      hint: t("headingNav.findCarePrescriptionHint"),
      Icon: FileScan,
    },
  ];

  return (
    <ul className="py-1">
      {items.map(({ to, title, hint, Icon }) => (
        <li key={to}>
          <Link
            to={to}
            className={baseRow}
            onClick={() => onNavigate?.()}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-tight">{title}</span>
              <span className="mt-0.5 block text-sm text-slate-500 dark:text-gray-400">{hint}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toggleProfileDropDown, setToggleProfileDropDown] = useState(false);
  const [findCareOpen, setFindCareOpen] = useState(false);
  const [mobileFindCareOpen, setMobileFindCareOpen] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");

  const findCareRef = useRef(null);

  const { locationName, setLocation, detectLocation, coordinates } = useLocationStore();
  const [isDetecting, setIsDetecting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!coordinates) {
      handleDetectLocation();
    }
  }, []);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      await detectLocation();
      setIsEditingLocation(false);
    } catch (err) {
      console.error("Auto-detection failed:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleLocationSubmit = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      if (newLocationName.trim()) {
        setLocation(newLocationName.trim(), null);
      }
      setIsEditingLocation(false);
    }
  };

  const handleLogout = () => {
    apiLogout()
      .then(() => {
        clearSession();
        navigate("/");
      })
      .catch(() => {
        clearSession();
        navigate("/");
      });
  };

  const params = new URLSearchParams(location.search);
  const searchType = params.get("type");
  const isHomeActive = location.pathname === "/" && !searchType;
  const isHospitalActive = searchType === "hospital";
  const isPharmacyActive = searchType === "pharmacy";
  const isMapActive = location.pathname === "/home/map";
  const isFindCareSection =
    location.pathname === "/search-department-service" || location.pathname === "/prescription-reader";

  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const clearSession = useAuthStore((state) => state.clearSession);
  const initialized = useAuthStore((state) => state.initialized);

  const isAmharic = useTranslation().i18n.language === "am";

  const closeFindCare = useCallback(() => setFindCareOpen(false), []);
  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
    setMobileFindCareOpen(false);
  }, []);

  useEffect(() => {
    if (!findCareOpen) return;
    const onPointerDown = (e) => {
      if (findCareRef.current && !findCareRef.current.contains(e.target)) {
        setFindCareOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [findCareOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setFindCareOpen(false);
        setMobileFindCareOpen(false);
        setToggleProfileDropDown(false);
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const linkClass = (isActive) =>
    `shrink-0 text-xs font-bold transition-all duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 sm:text-sm ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-gray-300"
    }`;

  const openFindCareMenu = () => {
    setToggleProfileDropDown(false);
    setFindCareOpen((o) => !o);
  };

  const openProfileMenu = () => {
    setFindCareOpen(false);
    setToggleProfileDropDown((o) => !o);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto max-w-[1780px] px-3 sm:px-4 md:px-6 lg:px-10 xl:px-12">
        <div className="flex min-h-[4rem] items-center justify-between gap-2 py-2 sm:min-h-[4.5rem] sm:gap-3 lg:min-h-[5rem]">
          {/* Brand */}
          <div className="flex min-w-0 shrink-0 items-center">
            <Link
              to="/"
              className="group flex max-w-[min(200px,52vw)] items-center gap-2 sm:max-w-[220px] md:max-w-none"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                closeMobileMenu();
              }}
            >
              <img
                src={isAmharic ? am_white : en_white}
                alt={t("headingNav.healthcare_platform")}
                className="h-9 w-auto max-w-full object-contain object-left sm:h-10 md:h-11"
              />
            </Link>
          </div>

          {/* Center nav — tablet+ */}
          <nav className="hidden min-w-0 flex-1 justify-center px-1 md:flex lg:px-2">
            <div className="flex max-w-full items-center gap-2 flex-wrap sm:gap-3 md:gap-4 lg:gap-8 xl:gap-10">
              <Link to="/" className={linkClass(isHomeActive)} onClick={closeFindCare}>
                {t("headingNav.home")}
              </Link>
              <Link to="/home/search?type=hospital&q=" className={linkClass(isHospitalActive)} onClick={closeFindCare}>
                {t("headingNav.hospitals")}
              </Link>
              <Link to="/home/search?type=pharmacy&q=" className={linkClass(isPharmacyActive)} onClick={closeFindCare}>
                {t("headingNav.pharmacies")}
              </Link>

              <div className="relative shrink-0" ref={findCareRef}>
                <button
                  type="button"
                  aria-expanded={findCareOpen}
                  aria-haspopup="true"
                  aria-controls="find-care-desktop-menu"
                  id="find-care-desktop-trigger"
                  onClick={openFindCareMenu}
                  className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-bold transition-all duration-200 sm:gap-1.5 sm:px-2.5 sm:py-2 sm:text-sm ${findCareOpen || isFindCareSection
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "text-slate-600 hover:bg-slate-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                    }`}
                >
                  {t("headingNav.findCareMenu")}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ease-out ${findCareOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                <div
                  id="find-care-desktop-menu"
                  role="menu"
                  aria-labelledby="find-care-desktop-trigger"
                  className={`absolute left-1/2 top-full z-[120] mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 origin-top transform rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-200 ease-out dark:border-gray-700 dark:bg-gray-900 dark:ring-white/10 ${findCareOpen
                    ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 scale-95 opacity-0"
                    }`}
                >
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-gray-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                      {t("headingNav.Find Care")}
                    </p>
                  </div>
                  <FindCareLinkRows onNavigate={closeFindCare} variant="desktop" />
                </div>
              </div>

              <Link
                to="/home/map"
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${isMapActive
                  ? "border-emerald-500 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-600"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                  }`}
                onClick={closeFindCare}
              >
                <FaMapMarkedAlt className="shrink-0" />
                <span>{t("headingNav.map")}</span>
              </Link>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-1.5 border-r border-slate-200 pr-2 dark:border-gray-800 md:gap-2 md:pr-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {!initialized ? (
              <div className="hidden items-center rounded-full p-1 hover:bg-slate-100 dark:hover:bg-gray-800 md:flex">
                <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
              </div>
            ) : isLoading ? (
              <div className="hidden items-center rounded-full p-1 hover:bg-slate-100 dark:hover:bg-gray-800 md:flex">
                <FaUserCircle size={28} className="text-slate-500 dark:text-gray-400" />
              </div>
            ) : !user ? (
              <div className="hidden items-center gap-2 md:flex md:gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/login", { state: { background: location } })}
                  className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 transition hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 sm:px-3 sm:text-sm"
                >
                  {t("Register.Login")}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/register", { state: { background: location } })}
                  className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:px-4 sm:text-sm"
                >
                  {t("Register.join_medFinder")}
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex md:gap-4">
                <div className="hidden flex-col items-end lg:flex">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400 dark:text-gray-500">
                    {t("headingNav.location")}
                  </span>
                  <div
                    className="group flex cursor-pointer items-center gap-1 text-slate-700 dark:text-gray-200"
                    onClick={() => {
                      setIsEditingLocation(true);
                      setNewLocationName(locationName);
                    }}
                  >
                    <HiOutlineLocationMarker className="text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400" />
                    {isEditingLocation ? (
                      <div className="flex items-center gap-1">
                        <input
                          autoFocus
                          type="text"
                          value={newLocationName}
                          onChange={(e) => setNewLocationName(e.target.value)}
                          onKeyDown={handleLocationSubmit}
                          onBlur={() => {
                            setTimeout(() => setIsEditingLocation(false), 200);
                          }}
                          className="w-24 border-b border-emerald-500 bg-slate-100 px-1 text-xs font-bold italic text-slate-800 outline-none dark:bg-gray-800 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetectLocation();
                          }}
                          className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                          title="Detect my location"
                        >
                          {isDetecting ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          ) : (
                            <FaMapMarkedAlt className="text-[10px]" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="max-w-[7rem] truncate text-xs font-bold italic transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {locationName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-slate-100 dark:hover:bg-gray-800"
                    onClick={openProfileMenu}
                    aria-expanded={toggleProfileDropDown}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 sm:h-9 sm:w-9">
                      <FaUserCircle className="h-7 w-7 sm:h-8 sm:w-8" />
                    </div>
                  </button>

                  {toggleProfileDropDown && (
                    <>
                      <div className="fixed inset-0 z-[105]" onClick={() => setToggleProfileDropDown(false)} aria-hidden />
                      <div className="absolute right-0 z-[120] mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all duration-200 animate-in fade-in zoom-in dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-2 border-b border-slate-50 px-4 py-3 dark:border-gray-800">
                          <p className="text-xs font-bold text-slate-400">{t("headingNav.profile_dropdown.account")}</p>
                          <p className="truncate text-sm font-bold dark:text-white">{user?.Email}</p>
                        </div>
                        {user.status === "inactive" ? (
                          <p className="px-4 py-3 text-sm text-red-500">{t("headingNav.profile_dropdown.inactive")}</p>
                        ) : (
                          <NavLink
                            to="#"
                            onClick={() => {
                              if (roles?.includes("patient")) {
                                navigate("/user/dashboard", { replace: true });
                              } else {
                                navigateByRole(roles, navigate);
                              }
                              setToggleProfileDropDown(false);
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            <FaUser className="text-emerald-600" />
                            <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                          </NavLink>
                        )
                        }
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mobile / compact: lang, theme, menu */}
            <div className="flex md:hidden items-center gap-1 sm:gap-2 ">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen((o) => !o);
                setFindCareOpen(false);
              }}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-white dark:hover:bg-gray-800 md:hidden"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? t("common.close") : t("headingNav.openMenu")}
            >
              {isMenuOpen ? <IoMdClose size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel (portal to body so it covers full viewport and escapes any stacking/transform contexts) */}
      {isMenuOpen && typeof document !== "undefined" && createPortal(
        <>
          <div aria-hidden className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] md:hidden" onClick={closeMobileMenu} />
          <div className="fixed inset-x-0 top-14 bottom-0 bg-white dark:bg-gray-950 border-t border-slate-100 dark:border-gray-800 p-6 space-y-6 overflow-y-auto z-[10000] md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                to="/"
                className={`rounded-xl px-3 py-3 text-lg font-bold transition-colors ${isHomeActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "text-slate-800 dark:text-white"
                  }`}
                onClick={closeMobileMenu}
              >
                {t("headingNav.home")}
              </Link>
              <Link
                to="/home/search?type=hospital&q="
                className={`rounded-xl px-3 py-3 text-lg font-bold transition-colors ${isHospitalActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "text-slate-800 dark:text-white"
                  }`}
                onClick={closeMobileMenu}
              >
                {t("headingNav.hospitals")}
              </Link>
              <Link
                to="/home/search?type=pharmacy&q="
                className={`rounded-xl px-3 py-3 text-lg font-bold transition-colors ${isPharmacyActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "text-slate-800 dark:text-white"
                  }`}
                onClick={closeMobileMenu}
              >
                {t("headingNav.pharmacies")}
              </Link>

              <div className="rounded-xl border border-slate-100 dark:border-gray-800">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-3 text-left text-lg font-bold text-slate-800 dark:text-white"
                  onClick={() => setMobileFindCareOpen((o) => !o)}
                  aria-expanded={mobileFindCareOpen}
                >
                  {t("headingNav.findCareMenu")}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-emerald-600 transition-transform duration-200 dark:text-emerald-400 ${mobileFindCareOpen ? "rotate-180" : ""
                      }`}
                    aria-hidden
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${mobileFindCareOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <div className="overflow-hidden px-1 pb-2">
                    <FindCareLinkRows onNavigate={closeMobileMenu} variant="mobile" />
                  </div>
                </div>
              </div>

              <Link
                to="/home/map"
                className={`mt-2 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold shadow-md transition ${isMapActive ? "bg-emerald-700 text-white dark:bg-emerald-600" : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                onClick={closeMobileMenu}
              >
                <FaMapMarkedAlt /> {t("headingNav.open_live_map")}
              </Link>
            </div>

            {!initialized ? (
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 dark:border-gray-800">
                <div className="w-full h-12 bg-slate-100 rounded animate-pulse" />
                <div className="w-full h-12 bg-slate-100 rounded animate-pulse" />
              </div>
            ) : !user ? (
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="w-full rounded-2xl border-2 border-emerald-600 py-3.5 text-base font-bold text-emerald-700 dark:border-emerald-500 dark:text-emerald-300"
                >
                  {t("Login.Login")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/register");
                    closeMobileMenu();
                  }}
                  className="w-full rounded-2xl bg-emerald-700 py-3.5 text-base font-bold text-white shadow-lg dark:bg-emerald-600"
                >
                  {t("Register.join_medFinder")}
                </button>
              </div>
            ) : (
              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-gray-800">
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-gray-900"
                    onClick={() => setToggleProfileDropDown((o) => !o)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                      <FaUserCircle size={28} />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">{user?.Name}</span>
                  </button>

                  {toggleProfileDropDown && (
                    <>
                      <div className="fixed inset-0 z-[105]" onClick={() => setToggleProfileDropDown(false)} aria-hidden />
                      <div className="relative z-[120] mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                        <div className="border-b border-slate-50 px-4 py-3 dark:border-gray-800">
                          <p className="text-xs font-bold text-slate-400">{t("headingNav.profile_dropdown.account")}</p>
                          <p className="truncate text-sm font-bold dark:text-white">{user?.Email}</p>
                        </div>
                        <NavLink
                          to="#"
                          onClick={() => {
                            if (roles?.includes("patient")) {
                              navigate("/user/dashboard", { replace: true });
                            } else {
                              navigateByRole(roles, navigate);
                            }
                            setToggleProfileDropDown(false);
                            closeMobileMenu();
                          }}
                          className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-300"
                        >
                          <FaUser className="text-emerald-600" />
                          <span>{t("headingNav.profile_dropdown.my_dashboard")}</span>
                        </NavLink>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm font-bold text-red-500"
                        >
                          <LuLogOut /> {t("headingNav.profile_dropdown.logout")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </header>
  );
}
